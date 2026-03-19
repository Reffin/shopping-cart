import { useState, useEffect } from "react";
import { getProducts } from "../api";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../api";

const CATEGORIES = ["All", "Electronics", "Clothing", "Shoes", "Bags", "Accessories", "Home", "Sports"];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [added, setAdded] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    getProducts({ category, search, sort })
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, search, sort]);

  const handleAddToCart = (product) => {
    addToCart(product);
    setAdded(product._id);
    setTimeout(() => setAdded(null), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-yellow-400 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold mb-2">All Products</h1>
          <p className="text-orange-100">Discover our amazing collection</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Search & Sort */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
          />
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors bg-white"
          >
            <option value="">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name: A-Z</option>
          </select>
        </div>

        {/* Categories */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                category === c
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-500 shadow-sm"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="bg-gray-200 h-44 rounded-xl mb-4" />
                <div className="bg-gray-200 h-4 rounded w-3/4 mb-2" />
                <div className="bg-gray-200 h-4 rounded w-1/2 mb-4" />
                <div className="bg-gray-200 h-8 rounded-xl" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-gray-500 text-lg mb-2">No products found</p>
            <p className="text-gray-400 text-sm">Try a different search or category</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{products.length} products found</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <div key={product._id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden group">
                  {/* Image */}
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 h-44 flex items-center justify-center overflow-hidden rounded-t-2xl">
                    {product.image && product.image.startsWith("http") ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform" />
                    ) : (
                      <span className="text-6xl group-hover:scale-110 transition-transform">{product.image || "📦"}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs text-orange-500 font-semibold uppercase tracking-wider">{product.category}</p>
                      {product.stock < 5 && product.stock > 0 && (
                        <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full font-semibold">
                          Only {product.stock} left!
                        </span>
                      )}
                      {product.stock === 0 && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">
                          Out of stock
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1 truncate">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-extrabold text-orange-500">{formatPrice(product.price)}</span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                          product.stock === 0
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : added === product._id
                            ? "bg-green-500 text-white"
                            : "bg-orange-500 hover:bg-orange-600 text-white"
                        }`}
                      >
                        {product.stock === 0 ? "Out of Stock" : added === product._id ? "✓ Added!" : "+ Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

