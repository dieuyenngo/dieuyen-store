import { useState, useEffect, useCallback } from "react";

function useAdmin() {
  const token = sessionStorage.getItem("admin_token");
  const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  return { token, headers };
}

function StatusBadge({ status }) {
  const colors = {
    PENDING: "bg-yellow-100 text-yellow-800", PROCESSING: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-purple-100 text-purple-800", DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    REQUESTED: "bg-orange-100 text-orange-800", APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100"}`}>{status}</span>;
}

function LoginForm({ onLogin }) {
  const [key, setKey] = useState("");
  return (
    <div className="max-w-sm mx-auto mt-20 p-6 bg-white rounded-xl border border-gray-200">
      <h1 className="text-xl font-bold mb-4">Admin Login</h1>
      <form onSubmit={(e) => { e.preventDefault(); onLogin(key); }}>
        <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Admin API Key" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="submit" className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">Login</button>
      </form>
    </div>
  );
}

function ProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState({ name: "", slug: "", description: "", originalPrice: "", salePrice: "", stock: "0", category: "Electronics", images: "", ...product });

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...form,
      originalPrice: Number(form.originalPrice),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      stock: Number(form.stock),
      barcode: form.barcode || null,
      images: form.images ? form.images.split("\n").map((s) => s.trim()).filter(Boolean) : [],
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug</label><input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
      </div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
      <div className="grid grid-cols-3 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label><input type="number" step="0.01" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Sale Price</label><input type="number" step="0.01" value={form.salePrice || ""} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock</label><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
      </div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label><input type="text" value={form.barcode || ""} onChange={(e) => setForm({ ...form, barcode: e.target.value })} placeholder="8–13 digits" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
          {["Electronics", "Clothing", "Accessories", "Lifestyle"].map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Image URLs (one per line)</label><textarea value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
      <div className="flex gap-3">
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Save</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
      </div>
    </form>
  );
}

function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex border-b border-gray-200 mb-6">
      {tabs.map((t) => (
        <button key={t.key} onClick={() => onChange(t.key)} className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${active === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>{t.label}</button>
      ))}
    </div>
  );
}

export default function Admin() {
  const { token, headers } = useAdmin();
  const [authed, setAuthed] = useState(!!token);
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const api = useCallback(async (url, opts = {}) => {
    const res = await fetch(url, { ...opts, headers: { ...headers, ...opts.headers } });
    if (res.status === 401) { setAuthed(false); sessionStorage.removeItem("admin_token"); throw new Error("Unauthorized"); }
    return res.json();
  }, [headers]);

  function login(key) {
    sessionStorage.setItem("admin_token", key);
    setAuthed(true);
  }

  function logout() {
    sessionStorage.removeItem("admin_token");
    setAuthed(false);
  }

  useEffect(() => {
    if (!authed) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    api("/api/admin/products").then(setProducts).catch(() => {});
    // eslint-disable-next-line react-hooks/set-state-in-effect
    api("/api/admin/orders").then(setOrders).catch(() => {});
    // eslint-disable-next-line react-hooks/set-state-in-effect
    api("/api/admin/refunds").then(setRefunds).catch(() => {});
  }, [authed, api]);

  async function saveProduct(data) {
    if (editing) {
      await api(`/api/admin/products/${editing.id}`, { method: "PUT", body: JSON.stringify(data) });
    } else {
      await api("/api/admin/products", { method: "POST", body: JSON.stringify(data) });
    }
    setEditing(null); setShowForm(false);
    api("/api/admin/products").then(setProducts);
  }

  async function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;
    await api(`/api/admin/products/${id}`, { method: "DELETE" });
    api("/api/admin/products").then(setProducts);
  }

  async function updateOrderStatus(id, status) {
    await api(`/api/admin/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
    api("/api/admin/orders").then(setOrders);
  }

  async function handleRefund(id, status) {
    const notes = prompt("Admin notes (optional):");
    await api(`/api/admin/refunds/${id}`, { method: "PUT", body: JSON.stringify({ status, adminNotes: notes || "" }) });
    api("/api/admin/refunds").then(setRefunds);
    api("/api/admin/orders").then(setOrders);
  }

  if (!authed) return <LoginForm onLogin={login} />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700">Logout</button>
      </div>

      <Tabs tabs={[
        { key: "products", label: `Products (${products.length})` },
        { key: "orders", label: `Orders (${orders.length})` },
        { key: "refunds", label: `Refunds (${refunds.length})` },
      ]} active={tab} onChange={setTab} />

      {tab === "products" && (
        <div>
          <button onClick={() => { setEditing(null); setShowForm(!showForm); }} className="mb-4 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
            {showForm ? "Cancel" : "Add Product"}
          </button>

          {showForm && <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200"><ProductForm product={editing} onSave={saveProduct} onCancel={() => { setShowForm(false); setEditing(null); }} /></div>}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200 text-left text-gray-500"><th className="pb-3 pr-4">Name</th><th className="pb-3 pr-4">Category</th><th className="pb-3 pr-4">Price</th><th className="pb-3 pr-4">Stock</th><th className="pb-3 pr-4">Barcode</th><th className="pb-3"></th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium">{p.name}</td>
                    <td className="py-3 pr-4 text-gray-500">{p.category}</td>
                    <td className="py-3 pr-4">${p.originalPrice.toFixed(2)}{p.salePrice ? ` (Sale: $${p.salePrice.toFixed(2)})` : ""}</td>
                    <td className="py-3 pr-4">{p.stock}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-gray-500">{p.barcode || "—"}</td>
                    <td className="py-3 flex gap-2">
                      <button onClick={() => { setEditing(p); setShowForm(true); }} className="text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 text-left text-gray-500"><th className="pb-3 pr-4">Order ID</th><th className="pb-3 pr-4">Customer</th><th className="pb-3 pr-4">Total</th><th className="pb-3 pr-4">Status</th><th className="pb-3">Actions</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 pr-4 font-mono text-xs">{o.orderId}</td>
                  <td className="py-3 pr-4">{o.customerName}<br /><span className="text-gray-400 text-xs">{o.customerEmail}</span></td>
                  <td className="py-3 pr-4">${o.total.toFixed(2)}</td>
                  <td className="py-3 pr-4"><StatusBadge status={o.status} /></td>
                  <td className="py-3">
                    <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)} className="text-xs border border-gray-300 rounded px-2 py-1">
                      {["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "refunds" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 text-left text-gray-500"><th className="pb-3 pr-4">Order</th><th className="pb-3 pr-4">Reason</th><th className="pb-3 pr-4">Status</th><th className="pb-3">Actions</th></tr></thead>
            <tbody>
              {refunds.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 pr-4 font-mono text-xs">{r.order?.orderId || r.orderId}</td>
                  <td className="py-3 pr-4 max-w-xs truncate">{r.reason}</td>
                  <td className="py-3 pr-4"><StatusBadge status={r.status} /></td>
                  <td className="py-3">
                    {r.status === "REQUESTED" && (
                      <div className="flex gap-2">
                        <button onClick={() => handleRefund(r.id, "APPROVED")} className="text-xs text-green-600 hover:underline font-medium">Approve</button>
                        <button onClick={() => handleRefund(r.id, "REJECTED")} className="text-xs text-red-500 hover:underline font-medium">Reject</button>
                      </div>
                    )}
                    {r.adminNotes && <p className="text-xs text-gray-400 mt-1">Note: {r.adminNotes}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
