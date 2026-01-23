const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Stripe = require('stripe');
const cors = require('cors')({ origin: true });

admin.initializeApp();

// Initialize Stripe with your secret key
// Set this in Firebase: firebase functions:config:set stripe.secret_key="sk_live_xxx"
const stripe = new Stripe(functions.config().stripe?.secret_key || process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const SHIPPING_COST = 495; // $4.95 in cents

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

      // Add shipping as a line item
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping & Handling',
            description: 'Standard shipping',
          },
          unit_amount: SHIPPING_COST,
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
