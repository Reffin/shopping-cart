import { useState, useEffect } from "react";
import { getMyOrders } from "../api";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../api";

const STATUS_COLORS = {
  pending:    "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped:    "bg-purple-100 text-purple-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
};

const STATUS_ICONS = {
  pending:    "⏳",
  processing: "⚙️",
  shipped:    "🚚",
  delivered:  "✅",
  cancelled:  "❌",
};

export default function Orders({ onNavigate }) {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getMyOrders(token)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">📦</div>
        <p className="text-gray-500">Loading your orders...</p>
      </div>
    </div>
  );

  if (orders.length === 0) return (
    <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl mb-6">📭</div>
        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">No orders yet!</h2>
        <p className="text-gray-500 mb-8">Start shopping to see your orders here.</p>
        <button onClick={() => onNavigate("products")} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg">
          Start Shopping →
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8">My Orders 📦</h1>

        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-2xl shadow-sm overflow-hidden">

              {/* Order Header */}
              <div
                className="p-5 flex flex-wrap gap-4 items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === order._id ? null : order._id)}
              >
                <div>
                  <p className="text-xs text-gray-400 mb-1">Order ID</p>
                  <p className="font-mono text-sm font-bold text-gray-700">#{order._id.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Date</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {new Date(order.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total</p>
                  <p className="text-sm font-extrabold text-orange-500">{formatPrice(order.total)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                    {STATUS_ICONS[order.status]} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="text-gray-400">
                  {expanded === order._id ? "▲" : "▼"}
                </div>
              </div>

              {/* Order Details */}
              {expanded === order._id && (
                <div className="border-t border-gray-100 p-5">

                  {/* Items */}
                  <h3 className="font-bold text-gray-700 mb-3 text-sm">Items Ordered</h3>
                  <div className="space-y-3 mb-5">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <div className="bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                          {item.image || "📦"}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">x{item.qty} × {formatPrice(item.price)}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-800">{formatPrice(item.price * item.qty)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Address */}
                  <h3 className="font-bold text-gray-700 mb-2 text-sm">Shipping Address</h3>
                  <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                    <p className="font-semibold">{order.address.fullName}</p>
                    <p>{order.address.street}</p>
                    <p>{order.address.city}, {order.address.zip}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}