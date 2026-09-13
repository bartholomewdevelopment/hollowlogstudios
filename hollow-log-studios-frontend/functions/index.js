const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Stripe = require('stripe');
const cors = require('cors')({ origin: true });
const sharp = require('sharp');
const crypto = require('crypto');

admin.initializeApp();

// Initialize Stripe with your secret key
// Set this in Firebase: firebase functions:config:set stripe.secret_key="sk_live_xxx"
const stripe = new Stripe(functions.config().stripe?.secret_key || process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Shipping is charged once per order, based on the total number of items.
// Mirrors src/lib/shipping.ts — change both together. Amounts are in cents.
const SHIPPING_TIERS = [
  { maxItems: 1, cost: 495 },
  { maxItems: 3, cost: 795 },
  { maxItems: 5, cost: 999 },
];
const SHIPPING_PER_EXTRA_ITEM = 125;

function calculateShipping(itemCount) {
  if (itemCount <= 0) return 0;

  const tier = SHIPPING_TIERS.find(t => itemCount <= t.maxItems);
  if (tier) return tier.cost;

  const top = SHIPPING_TIERS[SHIPPING_TIERS.length - 1];
  return top.cost + (itemCount - top.maxItems) * SHIPPING_PER_EXTRA_ITEM;
}

/**
 * Create a Stripe Checkout Session
 */
exports.createCheckoutSession = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const { items, successUrl, cancelUrl } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ error: 'No items provided' });
        return;
      }

      // Create line items for Stripe
      const lineItems = items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.title || 'Art Product',
            description: item.description || undefined,
            images: item.image_url ? [item.image_url] : undefined,
            metadata: {
              product_id: item.id,
              product_type: item.type,
              size: item.size || '',
              color: item.color || '',
            },
          },
          unit_amount: Math.round((item.price || 0) * 100), // Convert to cents
        },
        quantity: item.quantity || 1,
      }));

      // Add shipping as a line item, priced by how many items are ordered
      const itemCount = items.reduce((n, item) => n + (item.quantity || 1), 0);
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping & Handling',
            description: `Standard shipping (${itemCount} item${itemCount === 1 ? '' : 's'})`,
          },
          unit_amount: calculateShipping(itemCount),
        },
        quantity: 1,
      });

      // Create the checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl || `${req.headers.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${req.headers.origin}/checkout/canceled`,
        shipping_address_collection: {
          allowed_countries: ['US', 'CA'],
        },
        billing_address_collection: 'required',
        metadata: {
          item_count: items.length.toString(),
          items_json: JSON.stringify(items.map(i => ({ id: i.id, type: i.type, qty: i.quantity }))),
        },
      });

      res.status(200).json({
        sessionId: session.id,
        url: session.url
      });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({
        error: error.message || 'Failed to create checkout session'
      });
    }
  });
});

/**
 * Stripe Webhook to handle successful payments
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = functions.config().stripe?.webhook_secret || process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment successful for session:', session.id);

      // Record the purchase in Firestore
      try {
        const purchaseData = {
          stripe_session_id: session.id,
          customer_email: session.customer_details?.email,
          customer_name: session.customer_details?.name,
          amount_total: session.amount_total / 100,
          payment_status: session.payment_status,
          shipping_address: session.shipping_details?.address,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          status: 'completed',
          metadata: session.metadata,
        };

        await admin.firestore().collection('purchases').add(purchaseData);
        console.log('Purchase recorded in Firestore');
      } catch (dbError) {
        console.error('Error recording purchase:', dbError);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
});

/**
 * Get checkout session details (for success page)
 */
exports.getCheckoutSession = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const sessionId = req.query.session_id;

      if (!sessionId) {
        res.status(400).json({ error: 'Session ID required' });
        return;
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items', 'customer_details'],
      });

      res.status(200).json({
        id: session.id,
        customer_email: session.customer_details?.email,
        customer_name: session.customer_details?.name,
        amount_total: session.amount_total / 100,
        payment_status: session.payment_status,
        line_items: session.line_items?.data,
      });
    } catch (error) {
      console.error('Error retrieving session:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * Web-sized copies of artwork images.
 *
 * Originals are often huge scans (one is 13,887 x 10,034 px, 107 MB), far too
 * heavy for a web page. Whenever a painting, book, character or mural is saved
 * with an image, this writes a 1600px display copy and a 320px thumbnail under
 * web/, cached for a year, and records their URLs on the document. The
 * original file is never changed. src/lib/webImage.ts reads the fields.
 */
const WEB_IMAGE_COLLECTIONS = ['paintings', 'books', 'characters', 'murals'];
const WEB_IMAGE_SIZES = { image_web_url: 1600, image_thumb_url: 320 };

/** Storage path from a Firebase download URL, or null if it lives elsewhere. */
function storagePathFromUrl(url, bucketName) {
  const match = /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/([^/]+)\/o\/([^?]+)/.exec(url || '');
  if (!match || match[1] !== bucketName) return null;
  return decodeURIComponent(match[2]);
}

async function writeWebImages(snap) {
  const data = snap.data();
  const source = data && data.image_url;
  // Already done for this image. This is also what stops the update below
  // from triggering another run.
  if (!source || data.image_web_source === source) return;

  const bucket = admin.storage().bucket();
  const path = storagePathFromUrl(source, bucket.name);
  if (!path) {
    console.log(`Skipping ${snap.ref.path}: image is not in this project's storage`);
    return;
  }

  const [original] = await bucket.file(path).download();
  const base = `web/${path.replace(/\.[^./]+$/, '')}`;
  const update = { image_web_source: source };

  for (const [field, size] of Object.entries(WEB_IMAGE_SIZES)) {
    const resized = await sharp(original, { limitInputPixels: false })
      .rotate() // honour camera orientation
      .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    const dest = `${base}-${size}.jpg`;
    const token = crypto.randomUUID();
    await bucket.file(dest).save(resized, {
      resumable: false,
      metadata: {
        contentType: 'image/jpeg',
        cacheControl: 'public, max-age=31536000, immutable',
        metadata: { firebaseStorageDownloadTokens: token },
      },
    });
    update[field] =
      `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(dest)}?alt=media&token=${token}`;
  }

  await snap.ref.update(update);
  console.log(`Web images written for ${snap.ref.path}`);
}

WEB_IMAGE_COLLECTIONS.forEach(collection => {
  exports[`webImages_${collection}`] = functions
    .runWith({ memory: '2GB', timeoutSeconds: 300 })
    .firestore.document(`${collection}/{docId}`)
    .onWrite(change => (change.after.exists ? writeWebImages(change.after) : null));
});
