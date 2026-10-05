# Mitreno Unified Commerce Monorepo

Official production monorepo for **Mitreno** (`mitreno.com`) — Hyperlocal & Pan-India Fashion E-Commerce Ecosystem.

## Architecture & Modules

| Directory | Module | Stack | Default Port / Target |
| :--- | :--- | :--- | :--- |
| [`GreztoApp/`](./GreztoApp) | **Mitreno Mobile Application** (`com.mitreno.app`) | React Native 0.87, TypeScript, Zustand, Hermes AOT | Android / iOS |
| [`backend/`](./backend) | **Centralized Go Native API & WebSocket Hub** | Go (Fiber v2, GORM, PostgreSQL, Firebase Admin, Cloudflare R2) | `:8080` (`api.mitreno.com`) |
| [`mitreno-website/`](./mitreno-website) | **Customer E-Commerce Website** | Next.js 15, React 19, Tailwind CSS v4 | `:3000` (`mitreno.com`) |
| [`mitreno-seller/`](./mitreno-seller) | **Standalone Seller Studio & KYC Portal** | Next.js 15, React 19, Tailwind CSS v4 | `:3002` (`seller.mitreno.com`) |
| [`mitreno-admin/`](./mitreno-admin) | **Super Admin & Governance Console** | Next.js, TypeScript, Tailwind CSS | `:3001` (`admin.mitreno.com`) |

## Quick Start

### 1. Go Backend (`backend/`)
```bash
cd backend
cp .env.example .env
go run ./cmd/api
```

### 2. Customer Website (`mitreno-website/`)
```bash
cd mitreno-website
cp .env.example .env.local
npm install
npm run dev
```

### 3. Seller Portal (`mitreno-seller/`)
```bash
cd mitreno-seller
cp .env.example .env.local
npm install
npm run dev
```

### 4. Super Admin Console (`mitreno-admin/`)
```bash
cd mitreno-admin
cp .env.example .env.local
npm install
npm run dev
```

### 5. Mobile App (`GreztoApp/`)
```bash
cd GreztoApp
npm install
npx react-native run-android
```
