# Snitch 🛍️

Snitch is a modern, high-performance, and secure full-stack e-commerce marketplace that connects **Buyers** and **Sellers** in a single, fluid web application. The platform features native payment gateway integration, secure OTP verification, media optimization, and robust access-controlled dashboards.

🔗 **Live Demo:** [https://ecommerce-9qpo.onrender.com/](https://ecommerce-9qpo.onrender.com/)  
🔗 **GitHub Repository:** [https://github.com/rishiofficial965-hub/ecommerce](https://github.com/rishiofficial965-hub/ecommerce)

---

## 🚀 Key Features (MVPs)

### 🛒 1. Double-Sided E-Commerce Ecosystem
*   **Seller Dashboard:** Dynamic dashboard displaying seller-owned inventory. Sellers have full CRUD control (Create, Read, Update, Delete) over products, pricing variations, stock levels, and direct media uploads.
*   **Buyer Storefront:** Sleek, animated interface allowing users to browse products, search, filter by category, interact with rich media sliders, manage a persistent shopping cart, and view personal order history.

### 🔐 2. Bulletproof Authentication & Auth Security
*   **Traditional Auth + OTP Verification:** Registration and password recovery are fortified with One-Time Password (OTP) validation via automated transactional emails.
*   **Single Sign-On (SSO):** Smooth integration with **Google OAuth 2.0** using Passport.js for hassle-free registrations.
*   **Role-Based Access Control (RBAC):** Middleware checks verify route access so buyers cannot access seller tools, and vice-versa.

### 💳 3. End-to-End Payment Orchestration
*   **Razorpay Integration:** Full checkout integration with pre-created orders on the backend.
*   **Cryptographic HMAC Verification:** To prevent client-side payment tampering, the backend validates Razorpay signatures with `sha256` HMAC validation before registering orders.
*   **Instant Automated Invoices:** Sends styled HTML transactional receipt emails upon payment approval.

### 🛡️ 4. Enterprise-Grade Security & Performance
*   **Security Headers:** Configured with **Helmet.js** to prevent cross-site scripting (XSS), clickjacking, and mime-sniffing.
*   **API Protection:** Rate limits configured via **Express Rate Limit** to prevent brute-force attacks, alongside **Express Validator** to sanitize payloads and prevent NoSQL injections.
*   **Single-Origin Serving:** In production, the backend server compiles and serves static React frontend assets directly, simplifying setups and eliminating CORS configurations.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19 & Vite (instant development builds and optimized packaging)
- **State Management:** Redux Toolkit (global state for Auth, Cart, and Products)
- **Styling & UI:** Tailwind CSS v4, Framer Motion (page animations and hover micro-interactions), SwiperJS (carousels), React Icons
- **HTTP Client:** Axios (configured with credentials and backend API proxying)

### Backend
- **Runtime & Web Framework:** Node.js & Express.js (Model-View-Controller design architecture)
- **Database:** MongoDB & Mongoose (flexible schemas for complex product configurations)
- **Upload Handler:** Multer (memory buffering storage)

### Third-Party Services
- **Razorpay:** Payment processing portal
- **Brevo (formerly Sendinblue):** Automated SMTP email sender
- **ImageKit.io:** Dynamic image delivery CDN
- **Passport.js:** Social auth wrapper

---

## 💻 Local Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB installed locally or a MongoDB Atlas URI connection string
- Accounts for ImageKit, Brevo, and Razorpay for API keys

### Step 1: Clone the Repository
```bash
git clone https://github.com/rishiofficial965-hub/ecommerce.git
cd ecommerce
```

### Step 2: Backend Configuration
Navigate to the `backend` folder and create a `.env` file:
```bash
cd backend
touch .env
```

Add the following environment variables:
```env
PORT=3000
MONGODB_URL=your_mongodb_connection_url
JWT_SECRET=your_jwt_secret_token

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Brevo SMTP Configuration
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_sender_email

# ImageKit CDN Credentials
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL=your_imagekit_url_endpoint

# Razorpay Keys
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Frontend App URL (for redirects)
FRONTEND_URL=http://localhost:5173
```

Install backend dependencies and run the server:
```bash
npm install
npm run dev
```

### Step 3: Frontend Configuration
In development, the Vite server is configured to proxy all `/api` requests to `http://localhost:3000`. No `.env` is required for the frontend.

Navigate to the `frontend` folder, install dependencies, and start the development server:
```bash
cd ../frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 📦 Production Build & Deployment

In production, the application runs as a single unit. To build the React app and bundle it inside the Express server:

```bash
cd backend
npm run build
npm start
```
This script will build the frontend assets, copy the output into `backend/dist`, and launch the Express server which serves the client on port `3000`.
