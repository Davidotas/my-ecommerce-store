"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/currency";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const { currency } = useCurrency();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5">
        <p className="text-gray-400 text-sm">Your cart is empty</p>
        <Link href="/" className="text-sm font-medium underline underline-offset-4 hover:text-gray-600 transition-colors">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Bag ({items.length})</h1>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Items */}
        <div className="lg:col-span-2 divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.id} className="flex gap-5 py-6">
              <div className="relative w-24 h-28 shrink-0 bg-gray-100 overflow-hidden">
                {item.image && (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-4 mb-1">
                  <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                  <span className="text-sm font-medium shrink-0">
                    {formatCurrency(item.price * item.quantity, currency)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-4">{formatCurrency(item.price, currency)} each</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-gray-200 w-fit">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 h-8 flex items-center justify-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(totalPrice, currency)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(totalPrice, currency)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="block w-full bg-black text-white text-sm font-medium text-center py-3.5 hover:bg-gray-900 transition-colors mb-3"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/"
              className="block w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
