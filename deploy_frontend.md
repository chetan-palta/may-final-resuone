# Deploying Frontend to Vercel

### Architecture Overview
- **Hosting**: Vercel
- **Framework**: Vite + React
- **Frontend URL**: `https://resuone.vercel.app`
- **Backend API**: `https://may-final-resuone.onrender.com`

---

### Prerequisites
1. Render backend deployed and healthy (`https://may-final-resuone.onrender.com/api/health`).
2. GitHub repository connected to Vercel.

---

### Step 1: Configure Project in Vercel
1. Log in to [Vercel](https://vercel.com).
2. Open your `resuone` project (or import from GitHub if not already present).
3. If importing for the first time:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

---

### Step 2: Configure Environment Variables
In Vercel -> Project Settings -> **Environment Variables**, configure:

| Variable | Value | Environment |
|---|---|---|
| `VITE_API_URL` | `https://may-final-resuone.onrender.com` | Production, Preview, Development |
| `VITE_GOOGLE_CLIENT_ID` | `67693100136-4guqlhu2dodr82gngrueus53sii1cvod.apps.googleusercontent.com` | Production, Preview, Development |

---

### Step 3: Trigger Deployment
1. Go to **Deployments** tab and click **Redeploy** (or push a new commit to trigger automatic deployment).
2. Once the build finishes, visit `https://resuone.vercel.app`.
3. Test Google authentication and resume features!
