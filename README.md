# 🧸 ToyVerse – Modern Toy Shop E-Commerce Platform (MERN Stack)

Welcome to **ToyVerse**, a complete, modern, and playful Toy Shop E-commerce platform built from the ground up using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) with **Vite**, **Tailwind CSS**, and **Framer Motion**.

---

## 🚀 Key Features

### 🛒 User & Customer Experience
- **Playful & Responsive UI**: Whimsical pastel gradients, rounded bouncy cards, smooth Framer Motion animations.
- **Browse & Discovery**:
  - Browse across **10 dedicated toy categories**: Soft Toys, Educational Toys, Remote Control Toys, Building Blocks, Dolls, Cars & Vehicles, Board Games, Baby Toys, Outdoor Toys, Puzzle Games.
  - Real-time search by toy name, brand, or skill.
  - Multi-faceted filters by **Category, Age Group, Brand, Price Range, and In-Stock availability**.
  - Sort by Price (Low to High, High to Low), Top Rated, Most Popular, and Newest Arrivals.
- **Toy Details Page**:
  - Multi-image gallery with thumbnail switcher.
  - Age rating badges, brand indicators, discount savings calculator.
  - Quantity selector and real-time stock indicator.
  - Interactive customer reviews: submit 1–5 star ratings, title, and written reviews with real-time score updates.
  - Related toy recommendations from the same category.
- **Cart & Wishlist**:
  - Persistent MongoDB-backed shopping cart.
  - Instant one-click wishlist heart toggles with animated toast notifications.
  - Dynamic free delivery progress bar (Free shipping on orders above ₹999).
  - Coupon system (`TOYJOY` for 15% discount).
- **Checkout & Payments**:
  - Multi-address delivery manager with default address selection.
  - **Razorpay Payment Gateway Integration** (Test Mode with cryptographic HMAC-SHA256 signature verification) and **Cash on Delivery (COD)**.
  - Server-side stock deduction and live price re-verification.
- **Order Tracking & Account**:
  - Order status visual timeline: `Pending` ➔ `Processing` ➔ `Shipped` ➔ `Delivered`.
  - Profile and address book management.

### 🛡️ Admin Management Portal
- **Dedicated Admin Login**: `/admin/login` with strict role-based access control.
- **Admin Dashboard**:
  - Real-time store analytics: Total Sales Revenue (₹), Total Orders, Total Users, Active Products.
  - Order status breakdown badges (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
  - Low-stock proactive alerts (items with $\le 5$ units).
  - Recent customer orders and review feed.
- **Product Inventory Management**:
  - Add new toys with multiple image uploads (Multer disk storage) or image URLs.
  - Edit toy details, adjust pricing, replenish stock quantities, and toggle homepage featured status.
  - Delete products with cascading database cleanup.
- **Category Management**:
  - View, add, edit, and delete categories with custom icons and pastel background themes.
- **Order Processing**:
  - View all customer orders with customer address and payment verification details.
  - One-click update of order status across lifecycle.
- **User Directory**:
  - View registered customers, their order participation count, and promote/demote administrator rights.
- **Financial & Sales Reports**:
  - 6-month monthly sales revenue chart.
  - Top 5 best-selling toys ranked by sales volume and generated revenue.
  - Category market share breakdown.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router DOM v7, Axios, Context API, Framer Motion, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, JWT (JSON Web Tokens), bcryptjs |
| **Media & Payments** | Multer (Multiple image uploads), Razorpay SDK |
| **Database** | MongoDB (with automatic fallback to `mongodb-memory-server` for zero-configuration local launch) |

---

## 📁 Project Structure

```text
toysshop/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── CategoryCard/CategoryCard.jsx
│   │   ├── Footer/Footer.jsx
│   │   ├── Loader/Loader.jsx
│   │   ├── Navbar/Navbar.jsx
│   │   ├── ProductCard/ProductCard.jsx
│   │   └── SearchBar/SearchBar.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   ├── ToastContext.jsx
│   │   └── WishlistContext.jsx
│   ├── layouts/
│   │   ├── AdminLayout.jsx
│   │   └── UserLayout.jsx
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AddProduct.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── EditProduct.jsx
│   │   │   ├── ManageCategories.jsx
│   │   │   ├── ManageOrders.jsx
│   │   │   ├── ManageUsers.jsx
│   │   │   └── SalesReports.jsx
│   │   └── user/
│   │       ├── Cart.jsx
│   │       ├── Checkout.jsx
│   │       ├── Home.jsx
│   │       ├── Login.jsx
│   │       ├── MyOrders.jsx
│   │       ├── ProductDetails.jsx
│   │       ├── Profile.jsx
│   │       ├── Register.jsx
│   │       ├── Shop.jsx
│   │       └── Wishlist.jsx
│   ├── routes/
│   │   └── ProtectedRoute.jsx
│   ├── services/
│   │   └── api.js
│   ├── styles/
│   │   └── index.css
│   ├── App.jsx
│   └── main.jsx
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── productController.js
│   │   ├── reviewController.js
│   │   ├── userController.js
│   │   └── wishlistController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── Address.js
│   │   ├── Cart.js
│   │   ├── Category.js
│   │   ├── Order.js
│   │   ├── Product.js
│   │   ├── Review.js
│   │   ├── User.js
│   │   └── Wishlist.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── productRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── seedData.js
│   ├── uploads/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🔑 Pre-Configured Accounts (Auto-Seeded)

When the server starts for the first time, it automatically detects an empty database and seeds categories, toys, sample orders, reviews, and test accounts:

| Account Type | Email | Password | Role | Features |
|---|---|---|---|---|
| **Store Administrator** | `admin@toystore.com` | `AdminPassword123!` | `admin` | Full access to `/admin/dashboard`, product CRUD, stock updates, orders, users & sales reports |
| **Demo Customer** | `user@toystore.com` | `UserPassword123!` | `user` | Full shopping flow, saved address, wishlist, cart, past orders |

> 💡 **Tip:** Both login pages include **One-Click Demo Login** buttons for instant testing without typing.

---

## ⚙️ Installation & Running the Application

### 1. Prerequisites
- **Node.js** v18+ (tested on v24)
- **MongoDB** (Optional: If local MongoDB is not running, the application automatically uses an embedded In-Memory MongoDB engine so everything works out of the box!)

### 2. Configure Environment Variables
The server environment is located at `server/.env`. A template is provided in `server/.env.example`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/toystore
JWT_SECRET=toystore_super_secret_jwt_key_2026
RAZORPAY_KEY_ID=rzp_test_toyShopDemoKey123
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 3. Running Backend (Node / Express API Server)
Open a terminal in the root folder:

```bash
cd server
npm install
node server.js
```
The server will start on **`http://localhost:5000`** and log:
```text
Connected to MongoDB...
Seeded 10 Categories
Seeded 14 Products
Toy Shop Server running on port 5000
```

### 4. Running Frontend (React + Vite)
In a second terminal in the project root:

```bash
npm install
npm run dev
```
Open **`http://localhost:5173`** (or the port indicated by Vite) in your browser.

---

## 🌐 REST API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create customer account
- `POST /api/auth/login` - Customer login (returns JWT)
- `POST /api/auth/admin-login` - Admin login (verifies `admin` role)
- `GET /api/auth/profile` - Get logged-in user profile
- `PUT /api/auth/profile` - Update user profile & password

### Products (`/api/products`)
- `GET /api/products` - Fetch toys with search, category, brand, age, price filters & sorting
- `GET /api/products/featured` - Get featured toys
- `GET /api/products/bestsellers` - Get top-rated & bestselling toys
- `GET /api/products/meta/filters` - Unique brands and age brackets
- `GET /api/products/:id` - Single toy details
- `POST /api/products` - Create new toy *(Admin only)*
- `PUT /api/products/:id` - Update toy details *(Admin only)*
- `DELETE /api/products/:id` - Delete toy *(Admin only)*
- `POST /api/products/upload` - Upload multiple toy images via Multer *(Admin only)*

### Categories (`/api/categories`)
- `GET /api/categories` - Fetch all 10 categories with product count
- `POST /api/categories` - Create category *(Admin only)*
- `PUT /api/categories/:id` - Update category *(Admin only)*
- `DELETE /api/categories/:id` - Delete category *(Admin only)*

### Cart & Wishlist (`/api/cart`, `/api/wishlist`)
- `GET /api/cart` - Get user cart with live product prices
- `POST /api/cart` - Add toy to cart (verifies stock)
- `PUT /api/cart/:productId` - Update item quantity
- `DELETE /api/cart/:productId` - Remove item from cart
- `DELETE /api/cart` - Empty cart
- `GET /api/wishlist` - Get saved items
- `POST /api/wishlist/:productId` - Toggle wishlist item

### Orders & Payments (`/api/orders`, `/api/payment`)
- `POST /api/payment/create-order` - Create Razorpay order amount
- `POST /api/payment/verify` - Verify Razorpay HMAC signature
- `POST /api/orders` - Create order with server-side price check and stock deduction
- `GET /api/orders/my-orders` - User order history
- `GET /api/orders/:id` - Order details & tracking status
- `GET /api/orders` - List all customer orders *(Admin only)*
- `PUT /api/orders/:id/status` - Update order status *(Admin only)*

### Reviews & Users (`/api/reviews`, `/api/users`)
- `GET /api/reviews/product/:productId` - Product reviews
- `POST /api/reviews/product/:productId` - Submit review & recompute average rating
- `GET /api/users` - List registered users *(Admin only)*
- `PUT /api/users/:id` - Promote/demote role *(Admin only)*
- `DELETE /api/users/:id` - Delete user *(Admin only)*

### Admin Analytics (`/api/admin`)
- `GET /api/admin/dashboard-stats` - Revenue, orders, status breakdown, low-stock alerts
- `GET /api/admin/sales-reports` - Monthly sales, top 5 selling toys, category revenue

---

## 🔒 Security Practices Implemented
- Passwords hashed using **bcryptjs** (salt factor 10).
- Stateless authorization via **JWT** sent in HTTP Authorization headers.
- **Strict Role-Based Authorization** (Admin endpoints guarded with `protect` and `admin` middleware).
- Server-side order verification: Frontend prices and totals are never trusted; the backend checks live MongoDB prices and available stock quantities before finalizing orders.
- Payment security: Razorpay crypto HMAC-SHA256 signature verification.
- Sensitive credentials kept exclusively inside `server/.env`.
