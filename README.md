# PixelVault - Full-Stack Image Gallery, Compression & Subscription Platform

A production-ready full-stack web application featuring high-performance image compression using **Intervention Image**, cloud storage sync with **Cloudflare R2** (with local storage fallback), **Google OAuth 2.0 (Gmail Signup)**, and complete **Subscription Management** integrated with dual payment gateways (**Stripe** + **Razorpay**).

---

## 🛠 Tech Stack Overview

| Layer | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite 6 | Fast SPA, Tailwind CSS v4, Lucide icons, Canvas Confetti |
| **Backend** | PHP 8.4 + Laravel 13 | REST API architecture, Sanctum Token Authentication |
| **Image Engine** | Intervention Image v4 | WebP next-gen conversion, smart downscaling, auto-orientation |
| **Storage** | Local Storage + Cloudflare R2 | S3-compatible cloud storage adapter via Flysystem AWS S3 |
| **Database** | MySQL (with SQLite local zero-config fallback) | Eloquent ORM, full relational migrations, seeders |
| **Authentication** | Google OAuth 2.0 + Sanctum | Gmail one-click login, ID token verification, personal access tokens |
| **Subscriptions** | Tiered Module (Free, Pro, Premium) | Monthly/yearly billing cycles, storage limits, access control |
| **Payments** | Stripe + Razorpay | Dual gateway checkout, webhooks, signature verification, sandbox mode |

---

## 📂 Google Drive Architecture & Concept

PixelVault has been rebuilt to look and function like a high-performance **Google Drive for Compressed Media**:

### 1. Left Sidebar Navigation
- **`+ New` Button:** Iconic Google Drive pill button with dropdown for "Upload image & compress" and "New folder".
- **📁 My Drive:** Root hierarchy of folders and image files with breadcrumb navigation.
- **⭐ Starred:** Dedicated pinned/favorited media section.
- **🕒 Recent:** Media sorted by latest activity.
- **🗑 Trash:** Soft-delete recycle bin with one-click **Restore** and **Empty Trash** capability.
- **☁️ Cloudflare R2 Bucket:** Live bucket connection and zero-egress mirror settings.
- **📊 Storage Quota (Google One Style):** Shows exact MBs used (e.g. `24.5 MB of 150 MB used`) with progress meter and a **"Get more storage"** button leading to Stripe / Razorpay upgrades.

### 2. Workspace & View Layouts
- **Folders Row:** Google Drive folder cards showing folder color, name, and file count. Double-click to navigate into sub-folders.
- **Grid View ⊞ vs List View ☰:** Toggle between thumbnail cards and a detailed table layout with columns for file name, compression reduction %, raw size, stored WebP size, storage disk (Local vs R2), and actions.
- **Details Drawer `(i)`:** Collapsible right-side inspector displaying high-resolution preview, real-time compression audit, dimensions, format, upload date, and quick action buttons.
- **Folder Organization:** Move files into folders or root with the "Move to..." dialog.

```text
gallery1/
├── backend/                  # PHP Laravel Framework (REST API)
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── AuthController.php          # Google OAuth, login, register, token auth
│   │   │   ├── ImageController.php         # Intervention Image compression, upload, serving
│   │   │   ├── SubscriptionController.php  # Stripe & Razorpay checkout, plans, webhooks
│   │   │   └── StorageController.php       # Local vs Cloudflare R2 status & test connectivity
│   │   └── Models/
│   │       ├── User.php                    # User, quota calculations, plan relationships
│   │       ├── Plan.php                    # Plans (Free, Pro, Premium, USD & INR pricing)
│   │       ├── Subscription.php            # Active subscriptions, expiration tracking
│   │       ├── Image.php                   # Images, compression metrics, dimensions, disk
│   │       └── PaymentTransaction.php      # Transaction logs for Stripe & Razorpay
│   ├── config/
│   │   ├── filesystems.php                 # 'public' local disk + 'r2' Cloudflare S3 disk
│   │   ├── services.php                    # Google, Stripe, Razorpay, Cloudflare config
│   │   └── cors.php                        # CORS policy for Vite SPA frontend
│   ├── database/
│   │   ├── migrations/                     # MySQL table migrations
│   │   └── seeders/DatabaseSeeder.php      # Seeders for default plans & demo users
│   └── routes/api.php                      # All 21 REST API endpoints
│
├── frontend/                 # React.js with Vite & Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                  # Brand, quota progress, plan badge, user menu
│   │   │   ├── GalleryView.jsx             # Grid, search, filters (Local/R2), lightbox
│   │   │   ├── UploadZone.jsx              # Drag & drop, quality slider, dimension constraints
│   │   │   ├── ImageModal.jsx              # Lightbox preview, compression metrics audit
│   │   │   ├── SubscriptionPlans.jsx       # Pricing tiers, USD/INR, Stripe & Razorpay modal
│   │   │   ├── StorageSettingsModal.jsx    # Cloudflare R2 live connectivity testing & stats
│   │   │   └── AccountModal.jsx            # User profile, active subscription & invoices
│   │   ├── api.js                          # Axios interceptors & typed API services
│   │   └── App.jsx                         # Main application shell
│   └── vite.config.js                      # Vite config with Tailwind CSS v4 & backend proxy
│
└── start-dev.bat             # One-click startup script for backend & frontend
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **PHP 8.2+** with `gd`, `pdo_mysql`, `curl`, `fileinfo`, `openssl`
- **Composer 2.x**
- **Node.js 18+** & **npm**
- **MySQL 8.x** (or SQLite for instant zero-config testing)

### 2. Start Backend Server
```bash
cd backend
php artisan serve --port=8000
```
Backend API will run at: `http://127.0.0.1:8000`

### 3. Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Open your browser at: `http://localhost:5173`

*(Or simply double click `start-dev.bat` on Windows to run both simultaneously).*

---

## 🔑 Default Test Accounts & Seed Data

The database comes pre-seeded with sample images and test accounts:

| Account Type | Email | Password | Active Plan | Storage Quota | R2 Access |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Demo User** | `demo@gallery.local` | `password123` | Free Plan | 150 MB | Local Only |
| **Pro User** | `pro@gallery.local` | `password123` | Pro Creator | 2 GB | Cloudflare R2 Enabled |

---

## 🗄️ Database Configuration (MySQL)

By default, the application runs on SQLite for zero-config testing. To point to your MySQL server, update `backend/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gallery_db
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
```

Then run the migrations and seeders:
```bash
cd backend
php artisan migrate:fresh --seed
```

---

## 🌐 Google OAuth 2.0 (Gmail Signup)

1. Go to [Google Cloud Console](https://console.cloud.google.com/) -> **APIs & Services** -> **Credentials**.
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Set Authorized JavaScript origins to `http://localhost:5173` and redirect URI to `http://localhost:5173/auth/google/callback`.
4. Copy the Client ID & Secret to `backend/.env`:
```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```
> **Note:** PixelVault also provides an integrated **One-Click Google Sign-In Simulator** inside the login modal, so you can test Google authentication and user provisioning immediately even before generating Google Cloud credentials.

---

## ☁️ Cloudflare R2 Bucket Configuration

Cloudflare R2 provides S3-compatible cloud object storage with **zero egress fees**.

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) -> **R2 Object Storage**.
2. Create a bucket (e.g. `pixelvault-gallery`).
3. Click **Manage R2 API Tokens** -> **Create API Token** with `Object Read & Write` permission.
4. Add credentials to `backend/.env`:
```env
FILESYSTEM_DISK=public # or set to 'r2' for default cloud storage

CLOUDFLARE_R2_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
CLOUDFLARE_R2_BUCKET=pixelvault-gallery
CLOUDFLARE_R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_URL=https://pub-<hash>.r2.dev
```
5. You can test your R2 connection anytime by clicking **R2 Storage** in the top navigation and pressing **Test Connection**.

---

## 💳 Payment Gateways: Stripe + Razorpay

PixelVault supports dual payment gateways:
- **Stripe**: International credit/debit cards, Apple Pay, Google Pay (USD).
- **Razorpay**: India & international cards, UPI, NetBanking, Wallets (INR / USD).

Configure your API keys in `backend/.env`:
```env
# Stripe
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Razorpay
RAZORPAY_KEY=rzp_test_...
RAZORPAY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

### Sandbox & Live Modes
Both gateways include instant sandbox simulation for local testing when keys are omitted or set to test mode, with instant plan activation, quota updates, transaction logging, and confetti confirmation!

---

## 📡 REST API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Email/password registration
- `POST /api/auth/login` - Email/password login (returns Sanctum Bearer token)
- `POST /api/auth/google` - Google OAuth 2.0 token exchange / Gmail sign-in
- `GET  /api/auth/user` - Get authenticated user profile, storage & plan stats
- `POST /api/auth/logout` - Revoke access token

### Image Management
- `GET    /api/images` - Gallery list with search, disk filter (`local`/`r2`), sort, pagination
- `POST   /api/images/upload` - Intervention Image compression & upload (quality, dimensions, storage disk)
- `GET    /api/images/{id}` - Single image details
- `GET    /api/images/{id}/serve` - Direct high-speed streaming / download
- `DELETE /api/images/{id}` - Delete image from storage & database

### Subscriptions & Billing
- `GET  /api/subscriptions/plans` - List subscription plans (Free, Pro, Premium)
- `GET  /api/subscriptions/current` - Current user active subscription & invoices
- `POST /api/subscriptions/checkout/stripe` - Create Stripe Checkout session
- `POST /api/subscriptions/checkout/razorpay` - Create Razorpay order
- `POST /api/subscriptions/verify/razorpay` - Verify Razorpay payment signature
- `POST /api/subscriptions/upgrade` - Complete plan upgrade
- `POST /api/subscriptions/cancel` - Cancel active subscription
- `POST /api/subscriptions/webhook/stripe` - Stripe webhook handler
- `POST /api/subscriptions/webhook/razorpay` - Razorpay webhook handler

### Cloud Storage
- `GET  /api/storage/status` - Storage driver status, local vs R2 usage stats
- `POST /api/storage/test-r2` - Test live connection to Cloudflare R2 bucket
