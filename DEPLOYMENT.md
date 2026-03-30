# Vercel Deployment via GitHub

## Phase 1: Push to GitHub
1. Stage changes: `git add .`
2. Commit: `git commit -m "Pushing latest updates for deployment"`
3. Push: `git push origin main`

## Phase 2: Vercel Setup
1. Import repo `Karthikeyan46/elite-crossfit-web-app` on Vercel.
2. IMPORTANT: Add environment variables in Vercel settings:
   - `VITE_GEMINI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Click Deploy.
