import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  function handleAdd() {
    if (!product) return;
    const image = Array.isArray(product.images) ? product.images[0] : product.image;
    const price = product.salePrice ?? product.originalPrice;
    addItem({ ...product, price, image });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-gray-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
        <p className="mt-2 text-gray-500">The product you&apos;re looking for doesn&apos;t exist.</p>
        <Link to="/" className="mt-6 inline-block text-blue-600 hover:underline">Back to shop</Link>
      </div>
    );
  }

  const image = Array.isArray(product.images) ? product.images[0] : product.image;
  const inStock = (product.stock ?? 1) > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to={`/?category=${encodeURIComponent(product.category)}`} className="hover:text-blue-600">
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
          <img src={image} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div>
          <span className="text-sm font-medium text-blue-600 uppercase tracking-wider">
            {product.category}
          </span>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-500">{product.rating} / 5</span>
          </div>

          <div className="mt-6">
            {product.salePrice ? (
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900">${product.salePrice.toFixed(2)}</span>
                <span className="text-xl text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
              </div>
            ) : (
              <p className="text-4xl font-bold text-gray-900">${product.originalPrice.toFixed(2)}</p>
            )}
          </div>

          <p className="mt-6 text-gray-600 leading-relaxed">{product.description}</p>

          <div className="mt-6 space-y-2">
            {inStock ? (
              <span className="inline-flex items-center gap-1 text-sm text-green-600 font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="text-sm text-red-500 font-medium">Out of Stock</span>
            )}
            {product.barcode && (
              <p className="text-xs text-gray-400 font-mono">Barcode: {product.barcode}</p>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={handleAdd}
              disabled={!inStock}
              className={`flex-1 sm:flex-none px-8 py-3 rounded-lg text-base font-medium transition-all ${
                inStock ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800" : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {added ? "Added!" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
