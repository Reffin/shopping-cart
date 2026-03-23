import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { placeOrder, formatPrice } from "../api";

export default function Checkout({ onNavigate }) {
  const { cart, cartTotal, clearCart } = useCart();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    street: "",
    city: "",
    zip: "",
  });

  const shipping = cartTotal >= 50 ? 0 : 5;
  const tax = cartTotal * 0.1;
  const total = cartTotal + shipping + tax;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const items = cart.map(i => ({
        productId: i._id,
        qty: i.qty,
      }));
      await placeOrder({ items, address: form }, token);
      clearCart();
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
      <div className="text-center bg-white rounded-2xl shadow-sm p-12 max-w-md mx-4">
        <div className="text-8xl mb-6">🎉</div>
        <h2 className="text-3xl font-extrabold text-gray-800 mb-3">Order Placed!</h2>
        <p className="text-gray-500 mb-8">Thank you for your order! We'll process it right away.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => onNavigate("orders")} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-all">
            View My Orders
          </button>
          <button onClick={() => onNavigate("products")} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-6 py-3 rounded-xl transition-all">
            Shop More
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Checkout 💳</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-extrabold text-gray-800 mb-4">📦 Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">Full Name</label>
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      placeholder="Ryan S. Carbonel"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">Street Address</label>
                    <input
                      name="street"
                      value={form.street}
                      onChange={handleChange}
                      required
                      placeholder="123 Main Street"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-600 mb-1 block">City</label>
                      <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        required
                        placeholder="Quezon City"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600 mb-1 block">ZIP Code</label>
                      <input
                        name="zip"
                        value={form.zip}
                        onChange={handleChange}
                        required
                        placeholder="1100"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-extrabold text-gray-800 mb-4">💳 Payment</h2>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-700">
                  <p className="font-semibold mb-1">💡 Demo Mode</p>
                  <p>This is a demo checkout. No real payment is processed.</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg text-lg"
              >
                {loading ? "Placing Order..." : "Place Order ✓"}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-extrabold text-gray-800 mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.map(item => (
                  <div key={item._id} className="flex gap-3 items-center">
                    <div className="bg-orange-50 w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                      {item.image && item.image.startsWith("http") ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <span>{item.image || "📦"}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">x{item.qty}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-800 flex-shrink-0">{formatPrice(item.price * item.qty)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-500 font-semibold" : ""}>{shipping === 0 ? "Free 🎉" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (10%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-extrabold text-gray-800 text-lg">
                  <span>Total</span>
                  <span className="text-orange-500">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
