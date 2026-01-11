# Railway Deployment Guide

Since the CLI deployment timed out, the most reliable way to deploy is via GitHub.

## 1. Push to GitHub
Ensure your code is pushed to your GitHub repository.

## 2. Deploy on Railway
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"** -> **"Deploy from GitHub repo"**
3. Select your repository
4. Click **"Deploy Now"**

## 3. Set Environment Variables
Once the project is created, go to the **"Variables"** tab and add these:

```
JWT_SECRET=kishan_saathi_super_secret_jwt_2024
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_WEATHER_API_KEY=your_google_weather_key
```

## 4. Get Backend URL
1. Go to **"Settings"** tab
2. Under **"Networking"**, click **"Generate Domain"**
3. Copy the generated URL (e.g., `https://backend-production.up.railway.app`)

## 5. Connect Frontend
1. Go to Vercel Dashboard -> Frontend Project -> Settings -> Environment Variables
2. Update `REACT_APP_API_URL` with your new Railway URL
3. Redeploy Frontend
