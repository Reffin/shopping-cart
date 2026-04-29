import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../api";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../api";

export default function Home() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(null);

  useEffect(() => {
    getProducts({ category: "All", search: "", sort: "" })
      .then(data => setFeatured(data.filter(p => p.featured).slice(0, 4)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    setAdded(product._id);
    setTimeout(() => setAdded(null), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-400 pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <p className="text-sm font-semibold tracking-widest uppercase mb-4 opacity-90">Welcome to ShopZone 🇵🇭</p>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            Shop Smart,<br />
            <span className="text-yellow-200">Save More.</span>
          </h1>
          <p className="text-lg opacity-90 mb-10 max-w-xl mx-auto">
            Discover amazing products with GCash, Maya, and card payments — fast and secure!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate("/products")}
              className="bg-white text-orange-500 font-extrabold px-8 py-4 rounded-2xl text-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              Shop Now →
            </button>
            <button
              onClick={() => navigate("/register")}
              className="bg-orange-600 text-white font-bold px-8 py-4 rounded-2xl text-lg hover:bg-orange-700 transition-all border-2 border-white/30"
            >
              Join Free
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "🚚", title: "Free Shipping", desc: "On orders over ₱50" },
            { icon: "↩️", title: "Easy Returns", desc: "30-day return policy" },
            { icon: "🔒", title: "Secure Payment", desc: "100% protected" },
            { icon: "💬", title: "24/7 Support", desc: "Always here to help" },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-all">
              <span className="text-3xl">{f.icon}</span>
              <p className="font-bold text-gray-800 mt-2 text-sm">{f.title}</p>
              <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-xs text-orange-500 font-semibold uppercase tracking-wider mb-1">Handpicked for you</p>
            <h2 className="text-3xl font-extrabold text-gray-800">Featured Products</h2>
          </div>
          <button onClick={() => navigate("/products")} className="text-orange-500 font-semibold text-sm hover:underline">
            View All →
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="bg-gray-200 h-40 rounded-xl mb-4" />
                <div className="bg-gray-200 h-4 rounded w-3/4 mb-2" />
                <div className="bg-gray-200 h-4 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-gray-500">No featured products yet.</p>
            <button onClick={() => navigate("/products")} className="mt-4 bg-orange-500 text-white font-bold px-6 py-2 rounded-xl">Browse All Products</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map(product => (
              <div key={product._id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden group cursor-pointer"
                onClick={() => navigate("/products")}>
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 h-40 flex items-center justify-center overflow-hidden">
                  {product.image && product.image.startsWith("http") ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform" />
                  ) : (
                    <span className="text-5xl group-hover:scale-110 transition-transform">{product.image || "📦"}</span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-orange-500 font-semibold uppercase tracking-wider mb-1">{product.category}</p>
                  <h3 className="font-bold text-gray-800 mb-1 truncate text-sm">{product.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-extrabold text-orange-500">{formatPrice(product.price)}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                      disabled={product.stock === 0}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                        product.stock === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : added === product._id ? "bg-green-500 text-white"
                        : "bg-orange-500 hover:bg-orange-600 text-white"
                      }`}
                    >
                      {added === product._id ? "✓" : "+ Cart"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-yellow-400 py-16 px-4 text-center text-white">
        <h2 className="text-3xl font-extrabold mb-4">Ready to start shopping? 🛍️</h2>
        <p className="mb-8 opacity-90">Join thousands of happy shoppers in the Philippines!</p>
        <button onClick={() => navigate("/products")} className="bg-white text-orange-500 font-extrabold px-10 py-4 rounded-2xl text-lg hover:shadow-xl transition-all">
          Browse All Products
        </button>
      </div>
    </div>
  );
}
