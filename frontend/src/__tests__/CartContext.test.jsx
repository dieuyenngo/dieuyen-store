import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "../context/CartContext.jsx";

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

describe("CartContext", () => {
  it("starts with an empty cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it("adds an item to the cart", () => {
    const product = { id: 1, name: "Test Product", price: 10, slug: "test" };
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(product);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe("Test Product");
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalPrice).toBe(10);
  });

  it("increments quantity when adding the same item twice", () => {
    const product = { id: 1, name: "Test", price: 10, slug: "test" };
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(product);
      result.current.addItem(product);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.totalPrice).toBe(20);
  });

  it("removes an item from the cart", () => {
    const product = { id: 1, name: "Test", price: 10, slug: "test" };
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(product);
      result.current.removeItem(1);
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it("updates item quantity", () => {
    const product = { id: 1, name: "Test", price: 10, slug: "test" };
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(product);
      result.current.updateQuantity(1, 5);
    });

    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.totalPrice).toBe(50);
  });

  it("clears the entire cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({ id: 1, name: "A", price: 10, slug: "a" });
      result.current.addItem({ id: 2, name: "B", price: 20, slug: "b" });
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it("throws error when used outside provider", () => {
    expect(() => {
      renderHook(() => useCart());
    }).toThrow("useCart must be used within CartProvider");
  });
});
