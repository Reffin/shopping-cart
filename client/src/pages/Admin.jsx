import { useState, useEffect } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct, getAllOrders, updateOrderStatus } from "../api";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../api";

const CATEGORIES = ["Electronics", "Clothing", "Shoes", "Bags", "Accessories", "Home", "Sports"];
const EMPTY_FORM = { name: "", description: "", price: "", image: "", category: "Electronics", stock: "", featured: false };

export default function Admin({ onNavigate }) {
  const { token } = useAuth();
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, o] = await Promise.all([getProducts(), getAllOrders(token)]);
      setProducts(p);
      setOrders(o);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch("http://localhost:5000/api/products/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm(prev => ({ ...prev, image: data.url }));
    } catch (err) {
      setError("Image upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (editing) {
        await updateProduct(editing, data, token);
      } else {
        await createProduct(data, token);
      }
      await loadData();
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditing(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image || "",
      category: product.category,
      stock: product.stock,
      featured: product.featured,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id, token);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status, token);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const totalRevenue = orders.filter(o => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">⚙️ Admin Panel</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your store</p>
          </div>
          <button onClick={() => onNavigate("home")} className="text-sm text-gray-500 hover:text-orange-500 transition-colors">
            ← Back to Store
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Products", value: products.length, icon: "📦", color: "bg-blue-50 text-blue-600" },
            { label: "Total Orders", value: orders.length, icon: "🛒", color: "bg-orange-50 text-orange-600" },
            { label: "Revenue", value: formatPrice(totalRevenue), icon: "💰", color: "bg-green-50 text-green-600" },
            { label: "Pending Orders", value: orders.filter(o => o.status === "pending").length, icon: "⏳", color: "bg-yellow-50 text-yellow-600" },
          ].map(stat => (
            <div key={stat.label} className={`${stat.color} rounded-2xl p-4`}>
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-2xl font-extrabold">{stat.value}</p>
              <p className="text-xs font-semibold opacity-70">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {["products", "orders"].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${tab === t ? "bg-orange-500 text-white shadow-md" : "bg-white text-gray-600 hover:bg-orange-50"}`}>
              {t === "products" ? "📦 Products" : "🛒 Orders"}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {tab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">{products.length} products total</p>
              <button onClick={() => { setShowForm(true); setEditing(null); setForm(EMPTY_FORM); }} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all">
                + Add Product
              </button>
            </div>

            {/* Product Form */}
            {showForm && (
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <h2 className="text-lg font-extrabold text-gray-800 mb-4">
                  {editing ? "Edit Product" : "Add New Product"}
                </h2>
                {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 mb-4">⚠️ {error}</div>}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">Product Name</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="iPhone 15 Pro" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 bg-white">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">Price (₱)</label>
                    <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required placeholder="999" min="0" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">Stock</label>
                    <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required placeholder="50" min="0" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">Description</label>
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required placeholder="Product description..." rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 resize-none" />
                  </div>

                  {/* Image Upload */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">Product Image</label>
                    <div className="space-y-2">
                      {/* Image Preview */}
                      {form.image && (
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-orange-50 flex items-center justify-center text-4xl border border-gray-200">
                          {form.image.startsWith("http") ? (
                            <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                          ) : (
                            <span>{form.image}</span>
                          )}
                        </div>
                      )}
                      {/* Upload Button */}
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold text-sm px-4 py-2 rounded-xl transition-colors border border-orange-200">
                          {uploading ? "Uploading..." : "📁 Upload Image"}
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                        </label>
                        {form.image && form.image.startsWith("http") && (
                          <span className="text-xs text-green-600 font-semibold">✓ Image uploaded!</span>
                        )}
                      </div>
                      {/* OR Emoji Input */}
                      <input
                        value={form.image.startsWith("http") ? "" : form.image}
                        onChange={e => setForm({ ...form, image: e.target.value })}
                        placeholder="Or type an emoji e.g. 📱"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-orange-500" />
                    <label htmlFor="featured" className="text-sm font-semibold text-gray-600">Featured on Homepage</label>
                  </div>

                  <div className="md:col-span-2 flex gap-3">
                    <button type="submit" disabled={saving || uploading} className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl transition-all">
                      {saving ? "Saving..." : editing ? "Update Product" : "Add Product"}
                    </button>
                    <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(EMPTY_FORM); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-6 py-2.5 rounded-xl transition-all">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-gray-400">Loading...</div>
              ) : products.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-4xl mb-3">📦</p>
                  <p className="text-gray-500">No products yet. Add your first product!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {["Product", "Category", "Price", "Stock", "Featured", "Actions"].map(h => (
                          <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.map(product => (
                        <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="bg-orange-50 w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                                {product.image && product.image.startsWith("http") ? (
                                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span>{product.image || "📦"}</span>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 text-sm">{product.name}</p>
                                <p className="text-xs text-gray-400 truncate max-w-xs">{product.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs bg-orange-50 text-orange-600 font-semibold px-2 py-1 rounded-lg">{product.category}</span>
                          </td>
                          <td className="px-4 py-3 font-bold text-orange-500">{formatPrice(product.price)}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${product.stock === 0 ? "bg-red-100 text-red-600" : product.stock < 5 ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600"}`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {product.featured ? <span className="text-green-500">⭐ Yes</span> : <span className="text-gray-300">No</span>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => handleEdit(product)} className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold px-3 py-1.5 rounded-lg transition-colors">Edit</button>
                              <button onClick={() => handleDelete(product._id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {tab === "orders" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-4xl mb-3">🛒</p>
                <p className="text-gray-500">No orders yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {["Order ID", "Customer", "Items", "Total", "Status", "Date", "Update"].map(h => (
                        <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map(order => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-sm font-bold text-gray-700">#{order._id.slice(-8).toUpperCase()}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-gray-800">{order.user?.name || "Unknown"}</p>
                          <p className="text-xs text-gray-400">{order.user?.email}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{order.items.length} item(s)</td>
                        <td className="px-4 py-3 font-bold text-orange-500">{formatPrice(order.total)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            order.status === "delivered" ? "bg-green-100 text-green-700" :
                            order.status === "shipped" ? "bg-purple-100 text-purple-700" :
                            order.status === "processing" ? "bg-blue-100 text-blue-700" :
                            order.status === "cancelled" ? "bg-red-100 text-red-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString("en-PH")}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={order.status}
                            onChange={e => handleStatusChange(order._id, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-orange-400 bg-white"
                          >
                            {["pending", "processing", "shipped", "delivered", "cancelled"].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
