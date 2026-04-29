import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { placeOrder, createPaymentLink } from "../api";
import { formatPrice } from "../api";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const { token } = useAuth();
  const [address, setAddress] = useState({ fullName: "", street: "", city: "", zip: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tax = cartTotal * 0.1;
  const total = cartTotal + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const items = cart.map(item => ({ productId: item._id, qty: item.qty }));
      const order = await placeOrder({ items, address }, token);

      if (paymentMethod === "online") {
        const { url } = await createPaymentLink({
          amount: total,
          description: `ShopZone Order`,
          orderId: order._id,
        }, token);
        clearCart();
        window.location.href = url;
      } else {
        clearCart();
        navigate("/orders");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Checkout 🧾</h1>

        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl">⚠️ {error}</p>}

        <div className="grid md:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-extrabold text-gray-800 mb-4">📦 Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Full Name</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                    placeholder="Full Name"
                    value={address.fullName}
                    onChange={e => setAddress({ ...address, fullName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Street Address</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                    placeholder="Street Address"
                    value={address.street}
                    onChange={e => setAddress({ ...address, street: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">City</label>
                    <input
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                      placeholder="City"
                      value={address.city}
                      onChange={e => setAddress({ ...address, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">ZIP Code</label>
                    <input
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                      placeholder="ZIP Code"
                      value={address.zip}
                      onChange={e => setAddress({ ...address, zip: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-extrabold text-gray-800 mb-4">💳 Payment Method</h2>
              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "cod" ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-200"}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="accent-orange-500" />
                  <div>
                    <p className="font-bold text-gray-800">🚚 Cash on Delivery</p>
                    <p className="text-xs text-gray-500">Pay when your order arrives</p>
                  </div>
                </label>
                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "online" ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-200"}`}>
                  <input type="radio" name="payment" value="online" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} className="accent-orange-500" />
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">💳 Online Payment</p>
                    <p className="text-xs text-gray-500">GCash, Maya, Credit/Debit Card via PayMongo</p>
                  </div>
                  <div className="flex gap-1">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">GCash</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Maya</span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-semibold">Card</span>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-extrabold py-4 rounded-2xl text-lg transition-all shadow-lg"
            >
              {loading ? "Processing..." : paymentMethod === "online" ? "Pay with PayMongo →" : "Place Order →"}
            </button>
          </form>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-6 h-fit">
            <h2 className="text-lg font-extrabold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {cart.map(item => (
                <div key={item._id} className="flex gap-3 items-center">
                  <div className="bg-orange-50 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.image && item.image.startsWith("http") ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-xl">{item.image || "📦"}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">x{item.qty}</p>
                  </div>
                  <p className="text-xs font-bold">{formatPrice(item.price * item.qty)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600 font-semibold">
                <span>Shipping</span>
                <span>Free 🎉</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax (10%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-gray-800 text-lg border-t border-gray-100 pt-2">
                <span>Total</span>
                <span className="text-orange-500">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
