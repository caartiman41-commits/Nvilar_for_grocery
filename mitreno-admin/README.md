# 🔐 Nvilar Admin Console

A standalone enterprise administration portal for **Nvilar Marketplace**, built to manage boutique onboarding, review KYC document submissions (Aadhar, PAN, Voter ID, Driving License, GST), and oversee platform operations.

Designed as an independent Next.js project so it can be hosted on its own custom domain (e.g., `https://admin.nvilar.com`).

---

## 🚀 Key Features

1. **KYC Document Inspection**:
   - High-resolution Cloudflare R2 photo inspector with zoom, rotation, and pan.
   - Government ID verification (Aadhar 12-digit format, PAN format, GSTIN verification).
   - One-click copy for ID numbers and UPI settlement handles.

2. **Automated Approval Pipeline**:
   - Approving an application automatically:
     - Creates the live boutique `Shop` record.
     - Elevates the user's role to `boutique_owner`.
     - Dispatches welcome onboarding email.
     - Fires Firebase Cloud Messaging (FCM) push notification.

3. **Rejection Management**:
   - Configurable presets (blurry photos, PAN mismatch, invalid address).
   - Custom reason input sent directly to applicant's profile and email.
   - Allows applicants to fix errors and re-apply.

4. **Dual Data-Engine**:
   - Direct connection to Nvilar Go/Fiber backend (`/api/admin/*`).
   - Browser synchronization (`localStorage`) for standalone offline/demo evaluation.

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
# Starts on http://localhost:3001
```

### 3. Login
- **Demo Key**: `admin2026` or `mitreno_super_secret_admin_key_2026_go_enterprise`
- Or click **1-Click Demo Login** on the login screen.

---

## 🌐 Production Deployment

Deploy independently to Vercel, Cloudflare Pages, or AWS Amplify:
```bash
npm run build
npm run start
```
Configure environment variables:
- `NEXT_PUBLIC_BACKEND_URL`: `https://api.nvilar.com`
- `NEXT_PUBLIC_ADMIN_KEY`: `your_secure_admin_key`
