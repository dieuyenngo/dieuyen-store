import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const image = Array.isArray(product.images) ? product.images[0] : product.image || product.images;
  const displayPrice = product.salePrice ?? product.originalPrice;
  const inStock = (product.stock ?? 1) > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      <Link to={`/product/${product.slug}`}>
        <div className="aspect-square bg-gray-100 overflow-hidden">
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      <div className="p-4">
        <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">
          {product.category}
        </span>
        <Link to={`/product/${product.slug}`}>
          <h3 className="mt-1 font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={`w-3.5 h-3.5 ${
                i < Math.floor(product.rating)
                  ? "text-yellow-400"
                  : "text-gray-200"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-xs text-gray-400 ml-1">{product.rating}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div>
            {product.salePrice ? (
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-gray-900">
                  ${product.salePrice.toFixed(2)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          {inStock ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                addItem({ ...product, price: displayPrice, image });
              }}
              className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              Add to Cart
            </button>
          ) : (
            <span className="px-3 py-1.5 text-sm font-medium text-gray-400 bg-gray-100 rounded-lg">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
