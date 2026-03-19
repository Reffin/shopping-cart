import { useState, useEffect } from "react";
import { getProducts } from "../api";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../api";

export default function Home({ onNavigate }) {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [added, setAdded] = useState(null);

  useEffect(() => {
    getProducts({ featured: true })
      .then(data => setFeatured(data.slice(0, 4)))
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

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-400 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-widest uppercase">
              New Arrivals 2026
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Shop Smart.<br />
              <span className="text-yellow-200">Live Bold.</span>
            </h1>
            <p className="text-lg text-orange-100 mb-8 max-w-md">
              Discover thousands of products at unbeatable prices. Fast shipping, easy returns, and amazing deals every day!
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
              <button onClick={() => onNavigate("products")} className="bg-white text-orange-500 font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Shop Now →
              </button>
              <button onClick={() => onNavigate("register")} className="bg-orange-600/40 text-white font-semibold px-8 py-3 rounded-xl hover:bg-orange-600/60 transition-all border border-white/30">
                Join Free
              </button>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <div className="w-72 h-72 bg-white/10 rounded-full flex items-center justify-center text-9xl shadow-2xl">
                🛍️
              </div>
              <div className="absolute -top-4 -right-4 bg-yellow-300 text-orange-800 font-bold text-sm px-3 py-1 rounded-full shadow-lg">
                50% OFF!
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white text-orange-500 font-bold text-sm px-3 py-1 rounded-full shadow-lg">
                Free Shipping 🚚
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "🚚", title: "Free Shipping", desc: "On orders over $50" },
            { icon: "↩️", title: "Easy Returns", desc: "30-day return policy" },
            { icon: "🔒", title: "Secure Payment", desc: "100% protected" },
            { icon: "💬", title: "24/7 Support", desc: "Always here to help" },
          ].map(f => (
            <div key={f.title} className="flex items-center gap-3">
              <span className="text-2xl">{f.icon}</span>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-1">Handpicked for you</p>
            <h2 className="text-3xl font-extrabold text-gray-800">Featured Products</h2>
          </div>
          <button onClick={() => onNavigate("products")} className="text-orange-500 font-semibold text-sm hover:underline">
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
            <p className="text-gray-500 mb-4">No featured products yet.</p>
            <button onClick={() => onNavigate("products")} className="bg-orange-500 text-white px-6 py-2 rounded-xl font-semibold">
              Browse All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map(product => (
              <div key={product._id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden group">
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 h-40 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                  {product.image || "📦"}
                </div>
                <div className="p-4">
                  <p className="text-xs text-orange-500 font-semibold uppercase tracking-wider mb-1">{product.category}</p>
                  <h3 className="font-bold text-gray-800 mb-1 truncate">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-extrabold text-orange-500">{formatPrice(product.price)}</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${added === product._id ? "bg-green-500 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"}`}
                    >
                      {added === product._id ? "✓ Added!" : "+ Cart"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to start shopping? 🚀</h2>
          <p className="text-purple-200 mb-8 max-w-md mx-auto">Join thousands of happy customers and discover amazing products every day.</p>
          <button onClick={() => onNavigate("register")} className="bg-white text-purple-600 font-bold px-8 py-3 rounded-xl hover:bg-purple-50 transition-all shadow-lg">
            Create Free Account →
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-center py-6">
        <p className="text-sm">© 2026 ShopZone — Built by Ryan S. Carbonel</p>
      </footer>
    </div>
  );
}