# Kishan Saathi - Frontend

## Deployment to Vercel

### Prerequisites
- Vercel account
- Vercel CLI: `npm i -g vercel`

### Deploy Steps

1. Login to Vercel:
   ```bash
   vercel login
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel Dashboard:
   - `REACT_APP_API_URL` = Your backend URL (e.g., https://your-backend.railway.app/api)
   - `REACT_APP_GOOGLE_MAPS_API_KEY` = Your Google Maps API key

### Production Build
```bash
npm run build
vercel --prod
```
