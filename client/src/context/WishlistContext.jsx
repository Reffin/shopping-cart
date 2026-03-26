import { createContext, useContext, useState, useEffect } from "react";
import { getWishlist, addToWishlist, removeFromWishlist } from "../api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { token, isLoggedIn } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (!isLoggedIn) return setWishlist([]);
    getWishlist(token)
      .then(data => setWishlist(data.map(p => p._id)))
      .catch(console.error);
  }, [isLoggedIn]);

  const addItem = async (productId) => {
    try {
      await addToWishlist(productId, token);
      setWishlist(prev => [...prev, productId]);
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (productId) => {
    try {
      await removeFromWishlist(productId, token);
      setWishlist(prev => prev.filter(id => id !== productId));
    } catch (err) {
      console.error(err);
    }
  };

  const isInWishlist = (productId) => wishlist.includes(productId);
  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider value={{ wishlist, addItem, removeItem, isInWishlist, wishlistCount }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}