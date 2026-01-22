# Firebase Migration Setup Guide

This guide will walk you through setting up Firebase for your Hollow Log Studios website. Everything below uses Firebase's **FREE tier** - no credit card required!

## What Changed?

**Before (Paid):**
- MongoDB Atlas (Database) - $57+/month
- Cloudinary (Image Storage) - $89+/month
- Express Backend Server - Hosting costs
- **Total: $150+/month**

**After (FREE):**
- Firebase Firestore (Database) - FREE (1GB, 50K reads/day)
- Firebase Storage (Images) - FREE (5GB, 1GB/day downloads)
- Firebase Authentication (Admin Security) - FREE
- Firebase Hosting (Optional) - FREE (10GB storage)
- **Total: $0/month** 🎉

---

## Step 1: Create Firebase Project (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Project name: `hollow-log-studios` (or your choice)
4. Disable Google Analytics (not needed, keeps it simple)
5. Click **"Create project"**

---

## Step 2: Register Your Web App (2 minutes)

1. In Firebase Console, click the **Web icon** (`</>`) to add a web app
2. App nickname: `Hollow Log Studios Frontend`
3. Check **"Also set up Firebase Hosting"** (optional but recommended)
4. Click **"Register app"**
5. You'll see your Firebase configuration - **keep this tab open!**

---

## Step 3: Configure Your App (2 minutes)

1. Open this file: `hollow-log-studios-frontend/src/firebase/config.js`
2. Replace the placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",              // From Firebase Console
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**Where to find these values:**
- Firebase Console → Project Settings → General → Your apps → SDK setup and configuration

---

## Step 4: Enable Firestore Database (3 minutes)

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll configure security rules next)
4. Select a location close to your users (e.g., `us-central` for USA)
5. Click **"Enable"**

### Configure Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read artworks (for gallery)
    match /artworks/{artwork} {
      allow read: if true;
      allow write: if request.auth != null;  // Only authenticated admins
    }

    // Allow anyone to create bookings
    // Only authenticated admins can read/update/delete
    match /bookings/{booking} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

**What this does:**
- Anyone can view artwork (public gallery)
- Anyone can submit booking requests (contact form)
- Only logged-in admins can add/edit/delete artwork
- Only logged-in admins can view/manage bookings

---

## Step 5: Enable Firebase Storage (3 minutes)

1. In Firebase Console, go to **Build** → **Storage**
2. Click **"Get started"**
3. Choose **"Start in production mode"**
4. Use the default location
5. Click **"Done"**

### Configure Storage Rules

1. Go to **Storage** → **Rules** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow anyone to read images (for gallery)
    match /artworks/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;  // Only authenticated admins
    }
  }
}
```

3. Click **"Publish"**

---

## Step 6: Enable Authentication (5 minutes)

1. In Firebase Console, go to **Build** → **Authentication**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Click **"Email/Password"**
5. Enable the **first toggle** (Email/Password)
6. Click **"Save"**

### Create Admin User

1. Go to **Authentication** → **Users** tab
2. Click **"Add user"**
3. Enter your admin email and password
4. Click **"Add user"**

**Important:** Save these credentials securely - you'll use them to log into `/login`

---

## Step 7: Test Your Setup (5 minutes)

1. Start your frontend:
   ```bash
   cd hollow-log-studios-frontend
   npm start
   ```

2. Test the routes:
   - **Login:** http://localhost:3000/login (use admin credentials from Step 6)
   - **Admin Panel:** http://localhost:3000/admin (must be logged in)
   - **Gallery:** http://localhost:3000/gallery (public)
   - **Booking:** http://localhost:3000/booking (public)

3. Try adding an artwork in the admin panel:
   - Upload should go to Firebase Storage
   - Data should appear in Firestore Database

---

## Step 8: Deploy Backend Removal (Optional)

Since you no longer need the backend server, you can:

1. Stop the backend server (if running)
2. Remove backend dependencies from your workflow
3. Remove backend from deployment (Heroku, AWS, etc.)

Your React frontend now connects **directly** to Firebase - no backend needed!

---

## Step 9: Deploy Frontend (Optional)

### Option A: Firebase Hosting (FREE)

```bash
cd hollow-log-studios-frontend
npm run build

# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting
# Choose existing project
# Public directory: build
# Single-page app: Yes
# Overwrite index.html: No

# Deploy
firebase deploy
```

Your site will be live at: `https://YOUR_PROJECT_ID.web.app`

### Option B: Vercel (FREE)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Deploy with defaults
5. Done!

---

## New Project Structure

```
hollow-log-studios-frontend/
├── src/
│   ├── firebase/
│   │   ├── config.js              # Firebase configuration (UPDATE THIS!)
│   │   ├── artworkService.js      # Artwork CRUD operations
│   │   ├── bookingService.js      # Booking/inquiry operations
│   │   └── authService.js         # Authentication
│   ├── components/
│   │   ├── AdminPanel/            # Admin dashboard (protected)
│   │   ├── Login/                 # Admin login page
│   │   ├── Booking/               # Contact/booking form
│   │   ├── Gallery.js             # Public gallery
│   │   └── ProtectedRoute.js      # Authentication guard
│   └── App.js                     # Routes configured
```

---

## Available Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/login` | Admin login page | Public |
| `/admin` | Admin panel (manage artworks) | Protected (requires login) |
| `/gallery` | View all artworks | Public |
| `/booking` | Contact/booking form | Public |

---

## Features Summary

### Admin Panel (`/admin`)
- ✅ Add new artwork with image upload
- ✅ Edit existing artworks
- ✅ Delete artworks
- ✅ Manage Print/Original/Both pricing
- ✅ View all artworks in grid
- ✅ Protected by authentication

### Gallery (`/gallery`)
- ✅ Display all artworks
- ✅ Show pricing and availability
- ✅ Fast loading from Firestore
- ✅ Public access

### Booking (`/booking`)
- ✅ Contact form
- ✅ Stores inquiries in Firestore
- ✅ Name, email, phone, message fields
- ✅ Success/error handling
- ✅ Public access

### Authentication
- ✅ Email/password login
- ✅ Protected admin routes
- ✅ Session persistence
- ✅ Logout functionality

---

## Cost Breakdown (FREE Tier Limits)

### Firestore Database
- **Storage:** 1 GB
- **Reads:** 50,000 per day
- **Writes:** 20,000 per day
- **Deletes:** 20,000 per day

**For your art gallery:** Plenty! Even with 500 artworks and 1000 daily visitors.

### Firebase Storage
- **Storage:** 5 GB
- **Downloads:** 1 GB per day
- **Uploads:** 1 GB per day

**For your art gallery:** Can store 1000+ high-quality images easily.

### Firebase Authentication
- **Free tier:** 10,000 monthly active users
- **For your use:** More than enough for admin access.

---

## Troubleshooting

### Error: "Firebase not configured"
- Check `firebase/config.js` has correct credentials
- Make sure you replaced all "YOUR_..." placeholders

### Error: "Permission denied" when adding artwork
- Ensure you're logged in at `/login`
- Check Firestore security rules are published

### Images not uploading
- Check Storage security rules are published
- Verify Storage is enabled in Firebase Console

### Can't log in
- Verify admin user exists in Authentication → Users
- Check email/password are correct
- Check browser console for errors

---

## Next Steps (Optional Enhancements)

1. **Add Navbar:** Link between Gallery, Booking, Admin
2. **Manage Bookings:** Admin view to see all inquiries
3. **Email Notifications:** Use Firebase Functions to email on new bookings
4. **Image Optimization:** Compress images before upload
5. **Search & Filter:** Add category filter to gallery
6. **SEO:** Add meta tags and Open Graph for social sharing

---

## Need Help?

Firebase has excellent documentation:
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Storage Docs](https://firebase.google.com/docs/storage)
- [Auth Docs](https://firebase.google.com/docs/auth)

---

## Summary

You've successfully migrated from:
- **MongoDB + Cloudinary + Backend** ($150+/month)
- To **Firebase FREE tier** ($0/month)

All features preserved:
- ✅ Admin panel with authentication
- ✅ Image storage and management
- ✅ Public gallery
- ✅ Booking/contact form
- ✅ No backend server needed!

**Start using:** Complete Steps 1-7 above to get running! 🚀
