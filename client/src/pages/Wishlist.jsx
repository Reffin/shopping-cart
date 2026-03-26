import { useState, useEffect } from "react";
import { getWishlist } from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { formatPrice } from "../api";

export default function Wishlist({ onNavigate }) {
  const { token, isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const { removeItem } = useWishlist();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) return setLoading(false);
    getWishlist(token)
      .then(setWishlist)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId) => {
    await removeItem(productId);
    setWishlist(prev => prev.filter(p => p._id !== productId));
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setAdded(product._id);
    setTimeout(() => setAdded(null), 1000);
  };

  const handleMoveToCart = async (product) => {
    handleAddToCart(product);
    await handleRemove(product._id);
  };

  if (!isLoggedIn) return (
    <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
      <div className="text-center">
        <p className="text-8xl mb-6">🔖</p>
        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Save your favorites!</h2>
        <p className="text-gray-500 mb-8">Login to view your wishlist.</p>
        <button onClick={() => onNavigate("login")} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg">
          Login →
        </button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🔖</div>
        <p className="text-gray-500">Loading your wishlist...</p>
      </div>
    </div>
  );

  if (wishlist.length === 0) return (
    <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
      <div className="text-center">
        <p className="text-8xl mb-6">🔖</p>
        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Your wishlist is empty!</h2>
        <p className="text-gray-500 mb-8">Save products you love for later.</p>
        <button onClick={() => onNavigate("products")} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg">
          Browse Products →
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8">My Wishlist 🔖 <span className="text-lg text-gray-400 font-normal">({wishlist.length} items)</span></h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map(product => (
            <div key={product._id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden group">
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 h-44 flex items-center justify-center overflow-hidden rounded-t-2xl relative">
                {product.image && product.image.startsWith("http") ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain p-2" />
                ) : (
                  <span className="text-6xl">{product.image || "📦"}</span>
                )}
                <button
                  onClick={() => handleRemove(product._id)}
                  className="absolute top-2 right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-red-50 transition-colors text-red-400 hover:text-red-600"
                >
                  ✕
                </button>
              </div>

              <div className="p-4">
                <p className="text-xs text-orange-500 font-semibold uppercase tracking-wider mb-1">{product.category}</p>
                <h3 className="font-bold text-gray-800 mb-1 truncate">{product.name}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                <p className="text-lg font-extrabold text-orange-500 mb-3">{formatPrice(product.price)}</p>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleMoveToCart(product)}
                    disabled={product.stock === 0}
                    className={`w-full text-xs font-bold py-2 rounded-lg transition-all ${
                      product.stock === 0
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : added === product._id
                        ? "bg-green-500 text-white"
                        : "bg-orange-500 hover:bg-orange-600 text-white"
                    }`}
                  >
                    {product.stock === 0 ? "Out of Stock" : added === product._id ? "✓ Added!" : "🛒 Move to Cart"}
                  </button>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="w-full text-xs font-bold py-2 rounded-lg border border-orange-300 text-orange-500 hover:bg-orange-50 transition-all"
                  >
                    + Add to Cart (Keep)
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
