import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
}

// Admin route wrapper
function AdminRoute({ children }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

// Footer component
function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛍️</span>
          <span className="font-extrabold text-orange-400 text-lg">ShopZone</span>
        </div>
        <p className="text-gray-400 text-sm text-center">
          © 2026 ShopZone. All rights reserved.
        </p>
        <p className="text-gray-400 text-sm">
          Developed by <span className="text-orange-400 font-semibold">Ryan S. Carbonel</span>
        </p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/checkout" element={
            <ProtectedRoute><Checkout /></ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute><Orders /></ProtectedRoute>
          } />
          <Route path="/wishlist" element={
            <ProtectedRoute><Wishlist /></ProtectedRoute>
          } />

          {/* Admin Route */}
          <Route path="/admin" element={
            <AdminRoute><Admin /></AdminRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
