# Deploying Backend to Render with Supabase PostgreSQL

### Architecture Overview
- **Hosting**: Render (Web Service)
- **Database**: Supabase PostgreSQL (Connection Pooler / Supavisor)
- **URL**: `https://may-final-resuone.onrender.com`
- **Frontend Target**: `https://resuone.vercel.app`

---

### Step 1: Initialize Supabase Database
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project and select **SQL Editor** from the left navigation.
3. Open `backend/supabase_migration.sql` (or `supabase_migration.sql` at root).
4. Copy the entire SQL content and paste it into the Supabase SQL Editor.
5. Click **Run**.
6. Verify under **Table Editor** that `users` and `resumes` tables exist.
7. Go to **Project Settings** -> **Database**.
8. In the **Connection parameters** section:
   - Select **Connection pooling** (Supavisor).
   - Mode: **Transaction** or **Session** (Port 6543 or 5432).
   - Copy the URI connection string (e.g. `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`).
   - Replace `[PASSWORD]` with your actual database password.

---

### Step 2: Deploy to Render
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (`may-final-resuone`).
4. Configure service settings:
   - **Name**: `may-final-resuone`
   - **Region**: Oregon (or your preferred region)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. Under **Advanced** -> **Health Check Path**, enter: `/api/health`
6. Add the following **Environment Variables**:

| Variable | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Enables production mode & cross-site cookies |
| `PORT` | `10000` | Render default port |
| `BASE_URL` | `https://may-final-resuone.onrender.com` | Canonical backend URL for Google OAuth callback |
| `FRONTEND_URL` | `https://resuone.vercel.app` | Frontend origin for CORS and OAuth redirects |
| `DATABASE_URL` | `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres` | Supabase pooler connection string |
| `GOOGLE_CLIENT_ID` | `67693100136-4guqlhu2dodr82gngrueus53sii1cvod.apps.googleusercontent.com` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | `<your-google-client-secret>` | Google OAuth Client Secret |
| `JWT_SECRET` | `<secure-random-string>` | Secret key for signing user session JWTs |

7. Click **Create Web Service**.
8. Wait for the build and deployment to complete.
9. Verify health check: `https://may-final-resuone.onrender.com/api/health` returns `{"status":"ok"}`.
