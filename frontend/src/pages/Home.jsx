import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under $25", min: 0, max: 25 },
  { label: "$25 - $50", min: 25, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "Over $100", min: 100, max: Infinity },
];

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeCategory = searchParams.get("category") || "";
  const activePrice = searchParams.get("price") || "";
  const activeSearch = searchParams.get("search") || "";

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (activePrice) {
      const range = PRICE_RANGES.find((r) => r.label === activePrice);
      if (range) {
        if (range.min > 0) params.set("minPrice", range.min);
        if (range.max < Infinity) params.set("maxPrice", range.max);
      }
    }
    if (activeSearch) params.set("search", activeSearch);

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCategory, activePrice, activeSearch]);

  function setFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row gap-8">
        <aside className="sm:w-56 shrink-0">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-4">
            Filters
          </h2>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
            <div className="space-y-1">
              <button
                onClick={() => setFilter("category", "")}
                className={`block text-sm w-full text-left px-2 py-1.5 rounded ${
                  !activeCategory
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter("category", cat)}
                  className={`block text-sm w-full text-left px-2 py-1.5 rounded ${
                    activeCategory === cat
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Price Range
            </h3>
            <div className="space-y-1">
              {PRICE_RANGES.map((r) => (
                <button
                  key={r.label}
                  onClick={() => setFilter("price", r.label === "All Prices" ? "" : r.label)}
                  className={`block text-sm w-full text-left px-2 py-1.5 rounded ${
                    activePrice === r.label || (!activePrice && r.label === "All Prices")
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              {activeCategory || "All Products"}
            </h1>
            <p className="text-sm text-gray-500">
              {loading ? "..." : `${products.length} product${products.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"
                >
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No products found.</p>
              <button
                onClick={() => setSearchParams({})}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
