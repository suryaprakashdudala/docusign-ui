# Deployment Guide: Docusign Clone

Follow these steps to deploy your application to the cloud and share it with others.

## 1. MongoDB Atlas Setup
Before deploying the backend, you need a cloud database.
1.  **Sign Up**: Create an account at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas).
2.  **Create Cluster**: Follow the prompts to create a **Free Tier** cluster (Shared). Choose a provider like AWS and a region near you.
3.  **Database Access**: 
    *   Go to "Database Access".
    *   Add a new database user (e.g., `dbUser`).
    *   Choose "Password" authentication and save the password.
4.  **Network Access**:
    *   Go to "Network Access".
    *   Click "Add IP Address" and select **"Allow Access from Anywhere"** (0.0.0.0/0). *Note: This is necessary for Render's dynamic IPs.*
5.  **Connection String**:
    *   Go to "Deployment > Database".
    *   Click "Connect" on your cluster.
    *   Select "Drivers".
    *   Copy the **Connection String** (URI). Replace `<password>` with the password you created in Step 3.

## 2. Domain Purchase (GoDaddy)
Before deploying, it's recommended to have a custom domain for a professional look.
1.  Go to [GoDaddy.com](https://www.godaddy.com) and search for a domain.
2.  Purchase the domain and navigate to the **DNS Management** section.
3.  *Note: You will update the DNS records later when connecting to Vercel/Render.*

## 3. Email Service Setup (Resend)
The application uses **Resend** to send OTPs and document notifications.
1.  Create an account at [Resend.com](https://resend.com).
2.  **Add Domain**: Go to "Domains" and add your GoDaddy domain.
3.  **DNS Verification**: Resend will provide DNS records (MX, SPF, DKIM). Copy these to your **GoDaddy DNS Management** page.
4.  **API Key**: Once verified, go to "API Keys" and create a new key. Save this securely.

---

## 4. Backend Deployment (Render.com)

1.  **Create New Web Service**: Connect your GitHub repo.
2.  **Root Directory**: `docusign-api`
3.  **Environment**: `Docker`
4.  **Environment Variables**: Add the following in the Render dashboard:
    *   `DOCUSIGN_DB_URI`: your MongoDB Atlas URI (from Step 1).
    *   `DOCUSIGN_JWT_SECRET`: your jwt secret key.
    *   `RESEND_API_KEY`: your Resend API Key.
    *   `RESEND_FROM_EMAIL`: your verified email (e.g., `no-reply@yourdomain.com`).
    *   `DOCUSIGN_AWS_ACCESS_KEY`: your access key.
    *   `DOCUSIGN_AWS_SECRET_KEY`: your aws secret key.
    *   `DOCUSIGN_AWS_BUCKET`: your aws bucket name.
    *   `DOCUSIGN_AWS_REGION`: your aws region.
    *   `DOCUSIGN_FRONTEND_URL`: (Update this after Step 5).

---

## 5. Frontend Deployment (Vercel.com)

1.  **Import Project**: Connect GitHub.
2.  **Root Directory**: `docusign-ui`
3.  **Build Command**: `npm run build`
4.  **Output Directory**: `build`
5.  **Environment Variables**:
    *   `REACT_APP_API_URL`: (Your Render backend URL)/api (e.g., `https://docusign-api.onrender.com/api`)

---

## 6. Post-Deployment Connection

Once both are deployed:
1.  **Copy the Vercel URL** (e.g., `https://yourdomain.com`).
2.  **Update Render**: Go back to Render and update `DOCUSIGN_FRONTEND_URL` with this Vercel URL.
    *   *This ensures the backend allows the frontend to talk to it (CORS).*

---

## 7. Solving Render Cold Start (Free Tier)

Render's free tier services shutdown after 15 minutes of inactivity, causing a "cold start" delay (up to 1 minute) for the next user.

**Solution: Automated Pinging**
1.  Go to [cron-job.org](https://console.cron-job.org/jobs).
2.  **Create a New Job**:
    *   **Title**: `Docusign Backend Ping`
    *   **URL**: `(Your Render backend URL)/api/health`
    *   **Schedule**: Every 10 to 14 minutes.
3.  This keeps the service "warm" and responsive 24/7.
