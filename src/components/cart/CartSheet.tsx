'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from './CartContext'

export function CartSheet() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, cartTotal, totalSavings } = useCart()

  if (!isCartOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Sheet */}
      <div className="relative w-full max-w-md bg-surface shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <ShoppingBag className="size-5 text-primary" />
            <h2 className="text-xl font-black font-serif">Your Cart</h2>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
              {items.length} items
            </span>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70">
              <ShoppingBag className="size-12 mx-auto text-muted-foreground" />
              <p className="font-serif text-lg">Your cart is beautifully empty.</p>
              <Button variant="outline" onClick={() => setIsCartOpen(false)}>Continue Shopping</Button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.productId}-${idx}`} className="flex gap-4 p-4 border border-border bg-surface-container-low">
                <div className="relative size-24 bg-surface-container-highest shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-black text-sm">{item.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                      {item.size} {item.color ? `| ${item.color}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-border">
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size, item.color)}
                        className="p-2 hover:bg-black/5"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size, item.color)}
                        className="p-2 hover:bg-black/5"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                    <p className="font-serif font-black">₦{(item.price * item.quantity).toLocaleString("en-NG")}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-border bg-surface-dim space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold">Subtotal</span>
                <span className="font-serif font-black">₦{cartTotal.toLocaleString("en-NG")}</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between items-center text-xs text-primary font-bold uppercase tracking-widest">
                  <span>Your Savings</span>
                  <span>- ₦{totalSavings.toLocaleString("en-NG")}</span>
                </div>
              )}
            </div>
            <Button asChild size="lg" className="w-full" onClick={() => setIsCartOpen(false)}>
               <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
