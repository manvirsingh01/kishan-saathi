# Deployment Plan for Kishan Saathi

## Architecture
This is a full-stack app with:
- **Frontend**: React (can be deployed to Vercel)
- **Backend**: Node.js/Express with SQLite

## Important Note
> [!CAUTION]
> SQLite does NOT work on Vercel serverless functions (no persistent file storage).
> You need a **cloud database** for production.

## Recommended Deployment Strategy

### Option 1: Frontend on Vercel + Backend on Railway/Render (Recommended)
- Deploy frontend to Vercel
- Deploy backend to Railway (free tier available) or Render
- Connect via environment variables

### Option 2: Both on Vercel (Requires Database Migration)
- Migrate SQLite to PostgreSQL (Supabase/Neon free tier)
- Convert backend to Vercel serverless functions

---

## Files Created for Deployment

### Frontend (`frontend/vercel.json`)
- Configures Vercel to serve React app
- Sets up API proxy to backend URL

### Backend (`backend/vercel.json`)
- Serverless function configuration
- Requires database migration to work

### Environment Variables Needed
```
REACT_APP_API_URL=https://your-backend-url.com/api
GEMINI_API_KEY=your_key
JWT_SECRET=your_secret
DATABASE_URL=your_postgres_connection_string (if migrating)
```

## Quick Start (Frontend on Vercel, Backend Local/Railway)

1. Deploy frontend:
   ```bash
   cd frontend
   vercel
   ```

2. Set environment variable in Vercel dashboard:
   - `REACT_APP_API_URL` = your backend URL

3. Deploy backend to Railway:
   - Connect GitHub repo
   - Add backend folder as root
   - Set environment variables
