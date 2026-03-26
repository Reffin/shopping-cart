import { useState } from "react";
import { useAuth } from "./context/AuthContext";

// Pages
import Wishlist from "./pages/Wishlist";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Orders from "./pages/Orders";
import Admin from "./pages/Admin";

// Components
import Navbar from "./components/Navbar";

export default function App() {
  const [page, setPage] = useState("home");
  const { isLoggedIn, isAdmin } = useAuth();

  const navigate = (p) => {
    // Protect checkout and orders
    if (p === "checkout" && !isLoggedIn) return setPage("login");
    if (p === "orders" && !isLoggedIn) return setPage("login");
    if (p === "wishlist" && !isLoggedIn) return setPage("login");
    if (p === "admin" && !isAdmin) return setPage("home");
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPage = () => {
    switch (page) {
      case "home":     return <Home onNavigate={navigate} />;
      case "products": return <Products onNavigate={navigate} />;
      case "cart":     return <Cart onNavigate={navigate} />;
      case "checkout": return <Checkout onNavigate={navigate} />;
      case "login":    return <Login onNavigate={navigate} />;
      case "register": return <Register onNavigate={navigate} />;
      case "orders":   return <Orders onNavigate={navigate} />;
      case "admin":    return <Admin onNavigate={navigate} />;
      case "wishlist":  return <Wishlist onNavigate={navigate} />;
      default:         return <Home onNavigate={navigate} />;

    }
  };

  return (
    <div>
      <Navbar onNavigate={navigate} currentPage={page} />
      {renderPage()}
    </div>
  );
}