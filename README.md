# 🛍️ ShopZone — Full Stack E-Commerce App

A modern, full-featured e-commerce web application built with React, Node.js, MongoDB, and integrated with Philippine payment solutions.

🌐 **Live Demo:** [https://shopping-cart-peach-alpha.vercel.app](https://shopping-cart-peach-alpha.vercel.app)

---

## ✨ Features

### 🛒 Shopping
- Browse products by category (Electronics, Clothing, Shoes, Bags, etc.)
- **Search suggestions** — live dropdown as you type
- Filter by category
- Sort by price or name
- Product detail modal with images and descriptions
- Add to cart with quantity management

### 💳 Payments
- **PayMongo** integration — GCash, Maya, Credit/Debit Card, BPI Online, GrabPay
- Cash on Delivery option
- Secure checkout flow

### 📦 Orders
- Place and track orders
- Order history with status updates (Pending, Processing, Shipped, Delivered)
- **Order confirmation email** sent automatically via Brevo

### ⭐ Reviews
- Rate products 1-5 stars
- Write reviews (only for delivered orders)
- Average rating displayed on product cards
- One review per product per user

### 🔖 Wishlist
- Save products for later
- **Red badge counter** in navbar
- Move items from wishlist to cart
- Add to cart while keeping in wishlist

### 🔐 Authentication
- Register and login with JWT
- Protected routes
- Admin dashboard

### ⚙️ Admin Panel
- Add, edit, delete products with image upload (Cloudinary)
- View and manage all orders
- Update order status
- Featured product management

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React + Vite | UI Framework |
| Tailwind CSS | Styling |
| Context API | State Management |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | Server |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| Cloudinary | Image Storage |
| PayMongo | Payment Processing |
| Brevo | Email Service |

### Deployment
| Service | Purpose |
|---------|---------|
| Vercel | Frontend Hosting |
| Render | Backend Hosting |
| MongoDB Atlas | Database Hosting |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account
- PayMongo account
- Brevo account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Reffin/shopping-cart.git
cd shopping-cart
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

4. **Set up environment variables**

Create `server/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
PAYMONGO_SECRET_KEY=your_paymongo_key
BREVO_API_KEY=your_brevo_key
```

5. **Run the development servers**

Backend:
```bash
cd server
npm run dev
```

Frontend:
```bash
cd client
npm run dev
```

---

## 📁 Project Structure

```
shopping-cart/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api.js          # API functions
│   │   ├── context/        # Auth, Cart, Wishlist context
│   │   ├── pages/          # Home, Products, Cart, Orders, Wishlist
│   │   └── components/     # Navbar, Reviews
│   └── package.json
│
└── server/                 # Node.js backend
    ├── models/             # User, Product, Order, Review, Wishlist
    ├── routes/             # auth, products, orders, payments, reviews, wishlist
    ├── middleware/         # Auth, Cloudinary upload
    └── index.js            # Entry point
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/products` | Get all products |
| GET | `/api/products/suggestions` | Search suggestions |
| GET | `/api/products/featured` | Get featured products |
| POST | `/api/products` | Add product (Admin) |
| POST | `/api/orders` | Place order + send email |
| GET | `/api/orders/my` | Get user orders |
| GET | `/api/reviews/:id` | Get product reviews |
| POST | `/api/reviews/:id` | Add review (delivered orders only) |
| GET | `/api/wishlist` | Get wishlist |
| POST | `/api/wishlist/:id` | Add to wishlist |
| DELETE | `/api/wishlist/:id` | Remove from wishlist |
| POST | `/api/payments/create-link` | Create PayMongo payment |

---

## 👤 Developer

**Ryan S. Carbonel**
- Portfolio: [https://portfolio-three-delta-dzyn1fzefk.vercel.app](https://portfolio-three-delta-dzyn1fzefk.vercel.app)
- GitHub: [https://github.com/Reffin](https://github.com/Reffin)

---

## 📄 License

MIT License — feel free to use this project as a reference or template!
