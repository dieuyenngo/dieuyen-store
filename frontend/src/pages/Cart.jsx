import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <svg
          className="mx-auto w-16 h-16 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
          />
        </svg>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Your cart is empty
        </h1>
        <p className="mt-2 text-gray-500">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">
          Shopping Cart ({totalItems} item{totalItems !== 1 ? "s" : ""})
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-700 font-medium"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 bg-white rounded-xl border border-gray-200 p-4"
          >
            <Link
              to={`/product/${item.slug}`}
              className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </Link>

            <div className="flex-1 min-w-0">
              <Link
                to={`/product/${item.slug}`}
                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {item.name}
              </Link>
              <p className="text-sm text-gray-500 mt-0.5">
                ${item.price.toFixed(2)} each
              </p>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        Math.max(1, item.quantity - 1)
                      )
                    }
                    className="px-2.5 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-10 text-center text-sm font-medium tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.quantity + 1)
                    }
                    className="px-2.5 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="text-sm text-red-500 hover:text-red-700 font-medium ml-auto"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="font-bold text-gray-900">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between text-lg">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="font-bold text-2xl text-gray-900">
            ${totalPrice.toFixed(2)}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Shipping calculated at checkout
        </p>
        <button className="mt-4 w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors">
          Checkout
        </button>
      </div>
    </div>
  );
}
