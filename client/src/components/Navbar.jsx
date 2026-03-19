import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onNavigate, currentPage }) {
  const { cartCount } = useCart();
  const { user, logout, isLoggedIn, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onNavigate("home");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Logo */}
        <button onClick={() => onNavigate("home")} className="text-2xl font-bold text-orange-500 tracking-tight">
          🛍️ ShopZone
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => onNavigate("home")} className={`text-sm font-medium transition-colors ${currentPage === "home" ? "text-orange-500" : "text-gray-600 hover:text-orange-500"}`}>
            Home
          </button>
          <button onClick={() => onNavigate("products")} className={`text-sm font-medium transition-colors ${currentPage === "products" ? "text-orange-500" : "text-gray-600 hover:text-orange-500"}`}>
            Products
          </button>
          {isLoggedIn && (
            <button onClick={() => onNavigate("orders")} className={`text-sm font-medium transition-colors ${currentPage === "orders" ? "text-orange-500" : "text-gray-600 hover:text-orange-500"}`}>
              My Orders
            </button>
          )}
          {isAdmin && (
            <button onClick={() => onNavigate("admin")} className={`text-sm font-medium transition-colors ${currentPage === "admin" ? "text-orange-500" : "text-gray-600 hover:text-orange-500"}`}>
              ⚙️ Admin
            </button>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Cart Button */}
          <button onClick={() => onNavigate("cart")} className="relative p-2 text-gray-600 hover:text-orange-500 transition-colors">
            <span className="text-xl">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>

          {/* Auth Buttons */}
          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-gray-600">Hi, <span className="font-medium text-orange-500">{user.name.split(" ")[0]}</span></span>
              <button onClick={handleLogout} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors">
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => onNavigate("login")} className="text-sm text-gray-600 hover:text-orange-500 font-medium transition-colors">
                Login
              </button>
              <button onClick={() => onNavigate("register")} className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg transition-colors">
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600">
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-3">
          <button onClick={() => { onNavigate("home"); setMenuOpen(false); }} className="text-sm text-gray-600 text-left py-1">Home</button>
          <button onClick={() => { onNavigate("products"); setMenuOpen(false); }} className="text-sm text-gray-600 text-left py-1">Products</button>
          {isLoggedIn && <button onClick={() => { onNavigate("orders"); setMenuOpen(false); }} className="text-sm text-gray-600 text-left py-1">My Orders</button>}
          {isAdmin && <button onClick={() => { onNavigate("admin"); setMenuOpen(false); }} className="text-sm text-gray-600 text-left py-1">⚙️ Admin</button>}
          {isLoggedIn ? (
            <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-sm text-red-500 text-left py-1">Logout</button>
          ) : (
            <>
              <button onClick={() => { onNavigate("login"); setMenuOpen(false); }} className="text-sm text-gray-600 text-left py-1">Login</button>
              <button onClick={() => { onNavigate("register"); setMenuOpen(false); }} className="text-sm text-orange-500 font-medium text-left py-1">Sign Up</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}