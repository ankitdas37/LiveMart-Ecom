<div align="center">
  <img src="./logo.jpg" alt="W!FOMART Logo" width="100%" />

  <br/>
  <br/>

  ![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
  ![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
  ![MySQL](https://img.shields.io/badge/MySQL-Sequelize-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
  ![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-010101?style=for-the-badge&logo=socket.io&logoColor=white)

  <br/>
  <br/>

  > **W!FOMART** is a full-stack, production-ready e-commerce platform built with React 19, Node.js, MySQL & Socket.IO.
  > Fast. Beautiful. Real-time. — *A BASRIC Company*

</div>

---

## ✨ Features

### 🛍️ Storefront

| Feature | Description |
|---|---|
| 🏠 **Dynamic Home** | Hero banners, category tiles, best sellers, featured products |
| 🔍 **Smart Shop** | Filter by category, price, rating — sort & search in real time |
| 📦 **Product Details** | Image gallery, reviews, return/replacement policy, add to cart |
| 🛒 **Cart & Checkout** | Guest + logged-in cart, pincode delivery estimate, coupon codes |
| 💳 **Payment** | Online (Razorpay/UPI) + Cash on Delivery with full invoice PDF |
| 📬 **Order Tracking** | Public track-by-ID + authenticated order detail page |
| 🔁 **Returns** | Per-item return/replacement requests with admin approval flow |
| ❤️ **Wishlist** | Save & manage wishlist items across sessions |
| 👤 **User Profile** | Edit profile, manage addresses, view sessions & login activity |
| 🔔 **Notifications** | Real-time socket + web push notifications with sound alerts |
| 🎫 **Support Tickets** | In-app help desk with admin reply + email confirmation |
| 🌐 **Google OAuth** | One-click sign in with Google |
| 🌙 **Dark Mode** | Full dark/light theme toggle with smooth transitions |
| 📱 **Mobile-first** | Fully responsive with a dedicated bottom navigation bar |

### 🛠️ Admin Panel

| Feature | Description |
|---|---|
| 📊 **Dashboard** | Live stats: revenue, orders, users, top products |
| 📦 **Order Management** | 10 status stages, bulk actions, instant status notifications |
| 🧑‍🤝‍🧑 **User Management** | View, block, promote/demote, force logout any user |
| 🏷️ **Product/Category CRUD** | Full product management with Cloudinary image upload |
| 🏷️ **Coupons** | Create percentage & fixed discount coupons with usage limits |
| 💸 **Extra Charges** | Configurable tax, packaging, or custom charges |
| 🖼️ **Hero Banners** | Upload & manage homepage hero carousel images |
| 🌟 **Best Sellers** | Pin products to the homepage best-sellers section |
| 🗺️ **Pincode Manager** | Set delivery availability and estimated days by pincode |
| 💳 **Online Payments** | View & verify all payment records |
| 🔔 **Notification Center** | Send real-time messages or broadcasts to any user |
| 🎧 **Support Panel** | Reply to tickets, send direct emails, view email history |
| 📋 **Admin Notes** | Private sticky notes for the admin team |
| ⚙️ **Settings** | Site-wide config: logo, contact info, social links |
| 🔄 **Returns Dashboard** | View & resolve all return/replacement requests |

---

## 🧱 Tech Stack

### Frontend
- **React 19** + **Vite 8** — ultra-fast dev & build
- **TailwindCSS v4** — utility-first styling
- **React Router v7** — client-side routing
- **Socket.IO Client** — real-time notifications
- **Axios** — HTTP client
- **Lucide React** — beautiful icon set
- **React Hot Toast** — elegant toast notifications
- **html2pdf.js** — client-side invoice PDF generation
- **date-fns** — date formatting

### Backend
- **Node.js** + **Express 5** — REST API server
- **Sequelize ORM** + **MySQL2** — database layer
- **Socket.IO** — real-time bidirectional events
- **JWT** — stateless authentication
- **Bcrypt.js** — password hashing
- **Nodemailer** — transactional email (Gmail SMTP)
- **Cloudinary** — cloud image storage
- **Multer** — file upload middleware
- **Helmet** + **CORS** + **Rate Limiting** — security hardening
- **web-push** — browser push notifications
- **Puppeteer** — server-side PDF generation
- **Google Auth Library** — OAuth verification
- **node-cache** — in-memory caching

---

## 📁 File Structure

```
E-Com/
│
├── 📁 frontend/                      # React + Vite Frontend
│   ├── 📁 public/
│   │   ├── 📁 sounds/
│   │   │   └── notification.mp3      # Notification sound file
│   │   └── sw.js                     # Service Worker (Web Push)
│   │
│   └── 📁 src/
│       ├── App.jsx                   # Root router & layout definitions
│       ├── main.jsx                  # React app entry point
│       ├── index.css                 # Global styles
│       │
│       ├── 📁 context/
│       │   ├── AuthContext.jsx       # User auth state & session
│       │   ├── CartContext.jsx       # Shopping cart state
│       │   ├── SocketContext.jsx     # Socket.IO + live notifications
│       │   ├── ThemeContext.jsx      # Dark / light mode
│       │   └── ServerStatusContext.jsx
│       │
│       ├── 📁 components/
│       │   ├── Navbar.jsx            # Top navigation bar
│       │   ├── Footer.jsx            # Site footer
│       │   ├── MobileNav.jsx         # Bottom mobile navigation
│       │   ├── ProductCard.jsx       # Reusable product card
│       │   ├── PageLoader.jsx        # Loading spinner
│       │   ├── ScrollToTop.jsx       # Auto scroll on route change
│       │   ├── SEO.jsx               # React Helmet SEO wrapper
│       │   ├── ImageModal.jsx        # Full-screen image viewer
│       │   ├── InvoiceTemplate.jsx   # HTML invoice for PDF
│       │   ├── ServerDownPage.jsx    # Offline / error fallback
│       │   ├── BugReportModal.jsx    # Bug reporting modal
│       │   └── 📁 admin/
│       │       ├── AdminDeleteModal.jsx
│       │       └── AdminMobileNav.jsx
│       │
│       ├── 📁 pages/
│       │   ├── Home.jsx
│       │   ├── Shop.jsx
│       │   ├── ProductDetails.jsx
│       │   ├── Checkout.jsx
│       │   ├── Payment.jsx
│       │   ├── OrderDetails.jsx
│       │   ├── OrderSuccess.jsx
│       │   ├── OrderHelp.jsx
│       │   ├── TrackOrder.jsx
│       │   ├── UserProfile.jsx
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   ├── ForgotPassword.jsx
│       │   ├── ContactUs.jsx
│       │   ├── About.jsx
│       │   ├── TechSupport.jsx
│       │   ├── PrivacyPolicy.jsx
│       │   ├── TermsOfService.jsx
│       │   ├── ShippingPolicy.jsx
│       │   ├── FAQ.jsx
│       │   └── 📁 admin/
│       │       ├── AdminLogin.jsx
│       │       ├── AdminLayout.jsx
│       │       ├── AdminDashboard.jsx
│       │       ├── AdminProducts.jsx
│       │       ├── AdminOrders.jsx
│       │       ├── AdminUsers.jsx
│       │       ├── AdminCategories.jsx
│       │       ├── AdminCoupons.jsx
│       │       ├── AdminNotifications.jsx
│       │       ├── AdminSupport.jsx
│       │       ├── AdminNotes.jsx
│       │       ├── AdminSettings.jsx
│       │       ├── AdminHero.jsx
│       │       ├── AdminBestSellers.jsx
│       │       ├── AdminPincodes.jsx
│       │       ├── AdminExtraCharges.jsx
│       │       ├── AdminOnlinePayments.jsx
│       │       ├── ProductForm.jsx
│       │       ├── ReturnsList.jsx
│       │       └── ReviewsAdmin.jsx
│       │
│       └── 📁 utils/
│           ├── cloudinaryImage.js    # Cloudinary URL optimizer
│           ├── imageCompressor.js    # Client-side image compression
│           ├── imageCompression.js   # Alt compressor (ProductForm)
│           └── pdfGenerator.js       # Client-side PDF builder
│
├── 📁 backend/                       # Node.js + Express Backend
│   ├── server.js                     # App entry point & middleware
│   ├── .env                          # Environment variables (private)
│   ├── .env.example                  # Environment variable template
│   │
│   ├── 📁 config/
│   │   ├── db.js                     # Sequelize + MySQL connection
│   │   └── cloudinary.js             # Cloudinary SDK config
│   │
│   ├── 📁 models/
│   │   ├── index.js                  # All model imports + associations
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Order.js / OrderItem.js
│   │   ├── Cart.js / CartItem.js
│   │   ├── Coupon.js
│   │   ├── Review.js
│   │   ├── Address.js
│   │   ├── Wishlist.js
│   │   ├── Pincode.js
│   │   ├── ExtraCharge.js
│   │   ├── AdminNote.js
│   │   ├── OTP.js
│   │   ├── SupportTicket.js
│   │   ├── EmailHistory.js
│   │   ├── Session.js
│   │   ├── LoginActivity.js
│   │   ├── Notification.js
│   │   ├── PushSubscription.js
│   │   └── Setting.js
│   │
│   ├── 📁 controllers/               # Business logic per domain
│   │   ├── authController.js         # Login, register, OTP, Google OAuth
│   │   ├── userController.js         # Profile, sessions, activity
│   │   ├── productController.js      # Product CRUD + search
│   │   ├── categoryController.js
│   │   ├── orderController.js        # Orders, status, returns, invoices
│   │   ├── cartController.js
│   │   ├── couponController.js
│   │   ├── reviewController.js
│   │   ├── addressController.js
│   │   ├── wishlistController.js
│   │   ├── notificationController.js
│   │   ├── supportController.js      # Tickets + direct email
│   │   ├── pincodeController.js
│   │   ├── extraChargeController.js
│   │   ├── adminNoteController.js
│   │   ├── dashboardController.js
│   │   ├── sessionController.js
│   │   └── settingController.js
│   │
│   ├── 📁 routes/                    # Express route definitions
│   │
│   ├── 📁 middleware/
│   │   └── authMiddleware.js         # JWT protect + admin guard
│   │
│   ├── 📁 socket/
│   │   └── socketManager.js          # Socket.IO room & event manager
│   │
│   └── 📁 utils/
│       ├── sendEmail.js              # Nodemailer email transporter
│       ├── webPush.js                # Web push notification helper
│       ├── pdfGenerator.js           # Puppeteer server-side PDF
│       ├── cache.js                  # node-cache wrapper
│       ├── requestParser.js          # IP / device parser utility
│       └── orderEmailTemplates.js    # Order status email HTML
│
└── README.md
```

---

## 🚀 Installation & Setup

### ✅ Prerequisites

Make sure these are installed on your machine:

| Tool | Minimum Version |
|---|---|
| **Node.js** | v18+ |
| **MySQL** | v8+ |
| **npm** | v9+ |
| **Git** | Any recent |

---

### 📥 Step 1 — Clone the Repository

```bash
git clone https://github.com/ankitdas37/LiveMart-Ecom.git
cd LiveMart-Ecom
```

---

### 🗄️ Step 2 — Create the MySQL Database

```sql
CREATE DATABASE ecommerce_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

> ✅ Sequelize will auto-create all tables on first run.

---

### ⚙️ Step 3 — Configure the Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# ── Database ──────────────────────────
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce_db

# ── Security ──────────────────────────
JWT_SECRET=generate_a_strong_64_char_secret

# ── Cloudinary (image storage) ────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── Email (Gmail SMTP) ────────────────
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password    # from myaccount.google.com/apppasswords

# ── Google OAuth ──────────────────────
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com

# ── Other ─────────────────────────────
DEVELOPER_EMAIL=dev@yourdomain.com
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
NODE_ENV=development
PORT=5000
```

> 💡 Generate a strong JWT secret:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

### 🟢 Step 4 — Start the Backend

```bash
# Inside /backend
npm install
npm run dev
```

> API running at **http://localhost:5000** ✅

---

### 🟦 Step 5 — Start the Frontend

```bash
# In a new terminal, inside /frontend
npm install
npm run dev
```

> App running at **http://localhost:5173** ✅

---

### 👑 Step 6 — Create Your Admin Account

1. Register a normal user account at `/signup`
2. Run this SQL to promote it to admin:

```sql
UPDATE Users SET role = 'admin' WHERE email = 'your_email@gmail.com';
```

3. Log in at **http://localhost:5173/admin/login** 🎉

---

## 🌐 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DB_HOST` | ✅ | MySQL host (e.g. `localhost`) |
| `DB_USER` | ✅ | MySQL username |
| `DB_PASSWORD` | ✅ | MySQL password |
| `DB_NAME` | ✅ | Database name |
| `JWT_SECRET` | ✅ | Long random string for JWT |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary account name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `EMAIL_USER` | ✅ | Gmail address for SMTP |
| `EMAIL_PASS` | ✅ | Gmail App Password |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth 2.0 client ID |
| `DEVELOPER_EMAIL` | ✅ | Developer contact form recipient |
| `FRONTEND_URL` | ✅ | Frontend base URL |
| `BACKEND_URL` | ✅ | Backend base URL |
| `PORT` | ❌ | API port (default: `5000`) |
| `NODE_ENV` | ❌ | `development` or `production` |

---

## 🔌 API Endpoints Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | User login |
| `POST` | `/api/auth/google` | Public | Google OAuth login |
| `GET` | `/api/products` | Public | List/search/filter products |
| `GET` | `/api/products/:id` | Public | Single product |
| `GET` | `/api/categories` | Public | All categories |
| `POST` | `/api/orders` | Public | Place an order |
| `GET` | `/api/orders/:id` | User | Order details |
| `GET` | `/api/users/orders` | User | My orders list |
| `PUT` | `/api/orders/:id/status` | Admin | Update order status |
| `GET` | `/api/cart` | User | Get cart |
| `POST` | `/api/cart` | User | Add to cart |
| `GET` | `/api/wishlist` | User | Get wishlist |
| `GET` | `/api/notifications` | User | Get notifications |
| `POST` | `/api/notifications` | Admin | Send notification |
| `POST` | `/api/support` | Public | Submit support ticket |
| `GET` | `/api/dashboard` | Admin | Admin dashboard stats |
| `GET` | `/api/users` | Admin | All users |
| `POST` | `/api/upload` | Auth | Upload image to Cloudinary |

---

## 🔔 Real-Time Events (Socket.IO)

| Event | Direction | Trigger |
|---|---|---|
| `notification` | Server → User | Order update, admin message, support reply |
| `force_logout` | Server → User | Admin revokes a user session |
| `join` | User → Server | User joins their private room on connect |

---

## 🤝 Contributing

We welcome contributions!

```bash
# 1. Fork the repo on GitHub
# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Make changes and commit
git commit -m 'feat: describe your change'

# 4. Push and open a Pull Request
git push origin feature/your-feature-name
```

Please follow conventional commit format: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.

---

## 📜 License

This project is proprietary software owned by **BASRIC**.

© 2026 W!FOMART. A BASRIC Company. All rights reserved.

---

<div align="center">
  <br/>
  <strong>Built with ❤️ by the BASRIC Team</strong>
  <br/><br/>
  <sub>© 2026 W!FOMART. A BASRIC Company. All rights reserved.</sub>
</div>
