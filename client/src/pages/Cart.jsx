import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../api";

export default function Cart({ onNavigate }) {
  const { cart, removeFromCart, updateQty, clearCart, cartTotal } = useCart();
  const { isLoggedIn } = useAuth();

  if (cart.length === 0) return (
    <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
      <div className="text-center">
        <p className="text-8xl mb-6">🛒</p>
        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Your cart is empty!</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
        <button onClick={() => onNavigate("products")} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg">
          Start Shopping →
        </button>
      </div>
    </div>
  );

  const shipping = cartTotal >= 50 ? 0 : 5;
  const tax = cartTotal * 0.1;
  const total = cartTotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Your Cart 🛒</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item._id} className="bg-white rounded-2xl shadow-sm p-4 flex gap-4 items-center">
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.image && item.image.startsWith("http") ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-4xl">{item.image || "📦"}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-orange-500 font-semibold uppercase tracking-wider">{item.category}</p>
                  <h3 className="font-bold text-gray-800 truncate">{item.name}</h3>
                  <p className="text-orange-500 font-extrabold">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item._id, item.qty - 1)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center transition-colors">−</button>
                  <span className="w-8 text-center font-bold text-gray-800">{item.qty}</span>
                  <button onClick={() => updateQty(item._id, item.qty + 1)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center transition-colors">+</button>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-extrabold text-gray-800">{formatPrice(item.price * item.qty)}</p>
                  <button onClick={() => removeFromCart(item._id)} className="text-xs text-red-400 hover:text-red-600 transition-colors mt-1">Remove</button>
                </div>
              </div>
            ))}
            <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600 transition-colors font-medium">
              🗑️ Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-extrabold text-gray-800 mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-500 font-semibold">
                    {cartTotal >= 50 ? "Free 🎉" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (10%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-extrabold text-gray-800 text-lg">
                  <span>Total</span>
                  <span className="text-orange-500">{formatPrice(total)}</span>
                </div>
              </div>

              {cartTotal < 50 && (
                <div className="bg-orange-50 rounded-xl p-3 mb-4 text-sm text-orange-600">
                  🚚 Add <strong>{formatPrice(50 - cartTotal)}</strong> more for free shipping!
                </div>
              )}

              <button
                onClick={() => isLoggedIn ? onNavigate("checkout") : onNavigate("login")}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                {isLoggedIn ? "Proceed to Checkout →" : "Login to Checkout →"}
              </button>

              <button onClick={() => onNavigate("products")} className="w-full mt-3 text-sm text-gray-500 hover:text-orange-500 transition-colors">
                ← Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
