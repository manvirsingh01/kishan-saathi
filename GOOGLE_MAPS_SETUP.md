# Google Maps API Setup Guide

## 🗺️ Getting Your Free Google Maps API Key

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account

### Step 2: Create a New Project
1. Click on the project dropdown (top left)
2. Click "New Project"
3. Name it "Kishan Saathi" or your preferred name
4. Click "Create"

### Step 3: Enable Maps JavaScript API
1. Go to "APIs & Services" > "Library"
2. Search for "Maps JavaScript API"
3. Click on it and press "Enable"
4. Also enable "Geocoding API" (optional, for better address lookup)

### Step 4: Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key that appears

### Step 5: Restrict Your API Key (Recommended)
1. Click "Edit API key" (pencil icon)
2. Under "Application restrictions":
   - Select "HTTP referrers"
   - Add: `http://localhost:3000/*` (for development)
3. Under "API restrictions":
   - Select "Restrict key"
   - Choose: "Maps JavaScript API"
4. Click "Save"

### Step 6: Add to Your Project
1. Open `/frontend/.env` file
2. Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual key:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyC...your-actual-key
   ```
3. Save the file
4. Restart frontend server: `npm start`

## 💰 Pricing
- Google Maps offers **$200 free credit per month**
- That's ~28,000 map loads per month
- Perfect for development and small-scale production!

## ✅ Quick Test
After adding the API key:
1. Restart the frontend
2. Login to your account
3. You should see a full Google Map with your farm location pinned!

---

**Need help?** Check Google's official guide: https://developers.google.com/maps/documentation/javascript/get-api-key
