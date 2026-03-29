'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SuccessPage() {
  const router = useRouter()
  const [count, setCount] = useState(5)

  useEffect(() => {
    if (count === 0) {
      router.push('/account/orders')
      return
    }
    const timer = setTimeout(() => setCount(count - 1), 1000)
    return () => clearTimeout(timer)
  }, [count, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 bg-[#d2ff1f] flex items-center justify-center mb-8">
        <span className="text-2xl">✓</span>
      </div>
      <p className="text-xs tracking-widest uppercase text-gray-500 mb-2">Order Confirmed</p>
      <h1 className="text-4xl font-bold mb-4">Thank you!</h1>
      <p className="text-gray-600 mb-6">Your order has been placed successfully.</p>
      <p className="text-sm text-gray-500 mb-8">Redirecting in {count}s...</p>
      <div className="flex gap-4">
        <Link href="/account/orders" className="bg-black text-white px-8 py-3 text-sm tracking-wider uppercase hover:bg-gray-800">
          View My Orders
        </Link>
        <Link href="/shop" className="border border-black text-black px-8 py-3 text-sm tracking-wider uppercase hover:bg-gray-100">
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
