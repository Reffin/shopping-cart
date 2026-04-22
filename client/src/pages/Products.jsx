import { useState, useEffect, useRef } from "react";
import { getProducts, getReviews, getSearchSuggestions } from "../api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { formatPrice } from "../api";
import Reviews from "../components/Reviews";

const CATEGORIES = ["All", "Electronics", "Clothing", "Shoes", "Bags", "Accessories", "Home", "Sports"];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [added, setAdded] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productRatings, setProductRatings] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const searchRef = useRef(null);
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const { addItem, removeItem, isInWishlist } = useWishlist();

  useEffect(() => {
    setLoading(true);
    getProducts({ category, search, sort })
      .then(async (data) => {
        setProducts(data);
        const ratings = {};
        await Promise.all(data.map(async (p) => {
          try {
            const r = await getReviews(p._id);
            ratings[p._id] = r;
          } catch {}
        }));
        setProductRatings(ratings);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, search, sort]);

  // Search suggestions
  useEffect(() => {
    if (searchInput.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const results = await getSearchSuggestions(searchInput);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch {}
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearchInput = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSuggestionClick = (name) => {
    setSearchInput(name);
    setSearch(name);
    setShowSuggestions(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setShowSuggestions(false);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setAdded(product._id);
    setTimeout(() => setAdded(null), 1000);
  };

  const handleWishlist = async (e, productId) => {
    e.stopPropagation();
    if (!isLoggedIn) return;
    if (isInWishlist(productId)) {
      await removeItem(productId);
    } else {
      await addItem(productId);
    }
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
          {/* Search with suggestions */}
          <div className="flex-1 relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="🔍 Search products..."
                value={searchInput}
                onChange={handleSearchInput}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
              />
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 z-50 overflow-hidden">
                {suggestions.map(s => (
                  <div
                    key={s._id}
                    onClick={() => handleSuggestionClick(s.name)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {s.image && s.image.startsWith("http") ? (
                        <img src={s.image} alt={s.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <span className="text-sm">{s.image || "📦"}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                      <p className="text-xs text-orange-500">{s.category}</p>
                    </div>
                    <span className="ml-auto text-gray-300 text-xs">→</span>
                  </div>
                ))}
              </div>
            )}
          </div>

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
                <div key={product._id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden group cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 h-44 flex items-center justify-center overflow-hidden rounded-t-2xl relative">
                    {product.image && product.image.startsWith("http") ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform" />
                    ) : (
                      <span className="text-6xl group-hover:scale-110 transition-transform">{product.image || "📦"}</span>
                    )}
                    {isLoggedIn && (
                      <button
                        onClick={(e) => handleWishlist(e, product._id)}
                        className="absolute top-2 right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:scale-110 transition-all"
                      >
                        <span className={isInWishlist(product._id) ? "text-red-500" : "text-gray-300"}>❤️</span>
                      </button>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs text-orange-500 font-semibold uppercase tracking-wider">{product.category}</p>
                      {product.stock < 5 && product.stock > 0 && (
                        <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full font-semibold">Only {product.stock} left!</span>
                      )}
                      {product.stock === 0 && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">Out of stock</span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1 truncate">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>

                    {productRatings[product._id]?.total > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-yellow-400 text-sm">★</span>
                        <span className="text-xs font-bold text-gray-700">{productRatings[product._id].avgRating}</span>
                        <span className="text-xs text-gray-400">({productRatings[product._id].total})</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-lg font-extrabold text-orange-500">{formatPrice(product.price)}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
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

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs text-orange-500 font-semibold uppercase tracking-wider">{selectedProduct.category}</p>
                <div className="flex items-center gap-2">
                  {isLoggedIn && (
                    <button
                      onClick={(e) => handleWishlist(e, selectedProduct._id)}
                      className="text-2xl hover:scale-110 transition-all"
                    >
                      <span className={isInWishlist(selectedProduct._id) ? "text-red-500" : "text-gray-300"}>❤️</span>
                    </button>
                  )}
                  <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 h-64 flex items-center justify-center rounded-xl mb-4 overflow-hidden">
                {selectedProduct.image && selectedProduct.image.startsWith("http") ? (
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-contain p-4" />
                ) : (
                  <span className="text-8xl">{selectedProduct.image || "📦"}</span>
                )}
              </div>

              <h2 className="text-2xl font-extrabold text-gray-800 mb-2">{selectedProduct.name}</h2>
              <p className="text-gray-500 text-sm mb-4">{selectedProduct.description}</p>

              {productRatings[selectedProduct._id]?.total > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-yellow-400 text-lg">★</span>
                  <span className="font-bold text-gray-800">{productRatings[selectedProduct._id].avgRating}</span>
                  <span className="text-gray-400 text-sm">({productRatings[selectedProduct._id].total} reviews)</span>
                </div>
              )}

              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-extrabold text-orange-500">{formatPrice(selectedProduct.price)}</span>
                <div className="flex items-center gap-2">
                  {selectedProduct.stock > 0 ? (
                    <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded-lg">{selectedProduct.stock} in stock</span>
                  ) : (
                    <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-1 rounded-lg">Out of stock</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => { handleAddToCart(selectedProduct); }}
                disabled={selectedProduct.stock === 0}
                className={`w-full font-bold py-3 rounded-xl transition-all text-white mb-4 ${
                  selectedProduct.stock === 0
                    ? "bg-gray-300 cursor-not-allowed"
                    : added === selectedProduct._id
                    ? "bg-green-500"
                    : "bg-orange-500 hover:bg-orange-600"
                }`}
              >
                {selectedProduct.stock === 0 ? "Out of Stock" : added === selectedProduct._id ? "✓ Added to Cart!" : "+ Add to Cart"}
              </button>

              <Reviews productId={selectedProduct._id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
