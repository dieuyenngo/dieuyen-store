import { useState } from "react";

const STATUS_STEPS = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

const STATUS_LABELS = {
  PENDING: "Order Placed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

function StatusBadge({ status }) {
  const colors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export default function OrderTracking() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/${orderId.trim()}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Order not found");
        throw new Error("Something went wrong");
      }
      setOrder(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-2">Track Your Order</h1>
      <p className="text-gray-500 mb-6">Enter your Order ID to check the status.</p>

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="e.g. YC-250613-AB12CD"
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {order && (
        <div className="mt-8 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-900">Order {order.orderId}</h2>
                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            {order.status !== "CANCELLED" && (
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  {STATUS_STEPS.map((step, i) => {
                    const currentIdx = STATUS_STEPS.indexOf(order.status);
                    const isActive = i <= currentIdx;
                    const isLast = i === STATUS_STEPS.length - 1;
                    return (
                      <div key={step} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
                          }`}>
                            {i + 1}
                          </div>
                          <span className={`mt-1 text-xs ${isActive ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                            {STATUS_LABELS[step]}
                          </span>
                        </div>
                        {!isLast && (
                          <div className={`flex-1 h-0.5 mx-2 mt-[-1.5rem] ${i < currentIdx ? "bg-blue-600" : "bg-gray-200"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover bg-gray-100" />
                  <span className="flex-1">{item.name} x{item.quantity}</span>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <p><strong>Name:</strong> {order.customerName}</p>
              <p><strong>Email:</strong> {order.customerEmail}</p>
            </div>
          </div>

          {order.refunds?.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <h3 className="font-semibold text-orange-800">Refund Request</h3>
              {order.refunds.map((r) => (
                <div key={r.id} className="mt-2 text-sm text-orange-700">
                  <p>Reason: {r.reason}</p>
                  <p>Status: <span className="font-medium">{r.status}</span></p>
                  {r.adminNotes && <p>Note: {r.adminNotes}</p>}
                </div>
              ))}
            </div>
          )}

          {order.status === "DELIVERED" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Need a refund?</h3>
              <p className="text-sm text-gray-500 mb-3">If something is wrong with your order, contact support to start a refund request.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
