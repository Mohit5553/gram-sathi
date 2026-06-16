# GramSathi Production Deployment Guide

This guide covers the deployment of the GramSathi platform across three services:
1. **MongoDB Atlas** (Database)
2. **Render.com** (Node.js Backend)
3. **Vercel** (React Frontend)

## 1. Database Setup (MongoDB Atlas)
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Ensure your cluster is active and your network access IP whitelist is set to `0.0.0.0/0` (allow all) to allow Render servers to connect.
3. Your provided connection string is:
   `mongodb+srv://chatAI:bawsfL1sbUHjKTVt@cluster0.ehduwnn.mongodb.net/gramsathi?retryWrites=true&w=majority`

## 2. Backend Deployment (Render.com)
The backend is secured using `Helmet`, `Express-Rate-Limit`, and strictly enforces `CORS`. 

1. Push your repository to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/) and connect your GitHub account.
3. Because we provided a `render.yaml` Blueprint file, you can go to **Blueprints -> New Blueprint Instance** and select your repository. Render will automatically configure the `gramsathi-backend` service!
4. **Environment Variables**: You must manually populate the missing variables in the Render Dashboard under **Environment**:
   - `MONGO_URI`: `mongodb+srv://chatAI:bawsfL1sbUHjKTVt@cluster0.ehduwnn.mongodb.net/gramsathi?retryWrites=true&w=majority`
   - `JWT_SECRET`: Generate a strong random string
   - `FRONTEND_URL`: (Wait until Vercel is deployed, then paste the exact Vercel URL here, e.g., `https://gramsathi.vercel.app`).
   - `EMAIL_USER`: `mohitmaurya644@gmail.com`
   - `EMAIL_PASS`: `fkpoyakeqmbupqaq`

## 3. Frontend Deployment (Vercel)
The frontend is a Vite + React SPA. We have included `vercel.json` to handle client-side routing correctly.

1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New -> Project** and import your GitHub repository.
3. Configure the **Framework Preset** to `Vite` (Vercel usually auto-detects this).
4. **Environment Variables**:
   - Set `VITE_API_BASE_URL` to the URL of your deployed Render backend (e.g., `https://gramsathi-backend.onrender.com/api`).
5. Click **Deploy**.

## Post-Deployment Checklist
- [ ] Ensure the Vercel URL is added to the Render `FRONTEND_URL` environment variable for CORS to allow traffic.
- [ ] Attempt to log in using an email address to verify Nodemailer OTP works in production.
- [ ] Verify that navigating directly to nested routes (e.g., `/admin/users`) works on Vercel without a 404 error.
