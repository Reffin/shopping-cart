import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../api";

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQty, cartTotal, clearCart } = useCart();
  const { isLoggedIn } = useAuth();

  if (cart.length === 0) return (
    <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl mb-6">🛒</div>
        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Your cart is empty!</h2>
        <p className="text-gray-500 mb-8">Add some products to get started.</p>
        <button onClick={() => navigate("/products")} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg">
          Browse Products →
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Your Cart 🛒</h1>
        <div className="grid md:grid-cols-3 gap-8">

          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item._id} className="bg-white rounded-2xl shadow-sm p-4 flex gap-4 items-center">
                <div className="bg-orange-50 w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.image && item.image.startsWith("http") ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-3xl">{item.image || "📦"}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                  <p className="text-orange-500 font-extrabold">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item._id, item.qty - 1)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold transition-colors">-</button>
                  <span className="font-bold text-gray-800 w-6 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item._id, item.qty + 1)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold transition-colors">+</button>
                </div>
                <button onClick={() => removeFromCart(item._id)} className="text-red-400 hover:text-red-600 transition-colors ml-2">✕</button>
              </div>
            ))}

            <button onClick={clearCart} className="text-sm text-gray-400 hover:text-red-500 transition-colors">
              🗑️ Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-6 h-fit">
            <h2 className="text-lg font-extrabold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {cart.map(item => (
                <div key={item._id} className="flex justify-between text-sm text-gray-600">
                  <span className="truncate mr-2">{item.name} x{item.qty}</span>
                  <span className="font-semibold">{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex justify-between">
                <span className="font-extrabold text-gray-800">Total</span>
                <span className="font-extrabold text-orange-500 text-lg">{formatPrice(cartTotal)}</span>
              </div>
            </div>
            <button
              onClick={() => isLoggedIn ? navigate("/checkout") : navigate("/login")}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg"
            >
              {isLoggedIn ? "Proceed to Checkout →" : "Login to Checkout →"}
            </button>
            <button onClick={() => navigate("/products")} className="w-full mt-3 text-sm text-gray-500 hover:text-orange-500 transition-colors">
              ← Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
