'use client'

import React, { createContext, useContext, useState, useEffect, startTransition } from 'react'

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  yards?: string;
  quantity: number;
  maxStock: number;
  originalPrice: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (productId: string, size?: string, color?: string, yards?: string) => void;
  updateQuantity: (productId: string, qty: number, size?: string, color?: string, yards?: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartTotal: number;
  totalSavings: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Track mount status for hydration safety
  useEffect(() => {
    startTransition(() => {
      setIsMounted(true)
    })
  }, [])

  // Hydrate from localStorage on initial mount
  useEffect(() => {
    const stored = localStorage.getItem('cart')
    if (stored) {
      try {
        startTransition(() => {
          setItems(JSON.parse(stored))
        })
      } catch {
        // Ignore invalid JSON
      }
    }
  }, [])

  // Sync to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('cart', JSON.stringify(items))
    }
  }, [items, isMounted])

  const addToCart = (newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setItems((prev) => {
      const existingKey = prev.findIndex(
        (i) => i.productId === newItem.productId && i.size === newItem.size && i.color === newItem.color && i.yards === newItem.yards
      )
      if (existingKey > -1) {
        const next = [...prev]
        next[existingKey].quantity = Math.min(next[existingKey].quantity + (newItem.quantity || 1), newItem.maxStock)
        return next
      }
      return [...prev, { ...newItem, quantity: newItem.quantity || 1 }]
    })
    setIsCartOpen(true)
  }

  const removeFromCart = (productId: string, size?: string, color?: string, yards?: string) => {
    setItems((prev) => prev.filter(i => !(i.productId === productId && i.size === size && i.color === color && i.yards === yards)))
  }

  const updateQuantity = (productId: string, qty: number, size?: string, color?: string, yards?: string) => {
    if (qty <= 0) return removeFromCart(productId, size, color, yards)
    setItems((prev) => {
      const next = [...prev]
      const index = next.findIndex(i => i.productId === productId && i.size === size && i.color === color && i.yards === yards)
      if (index > -1) {
        next[index].quantity = Math.min(qty, next[index].maxStock)
      }
      return next
    })
  }

  const clearCart = () => setItems([])

  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
  const totalSavings = items.reduce((total, item) => total + (item.originalPrice - item.price) * item.quantity, 0)

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity, clearCart, isCartOpen, setIsCartOpen, cartTotal, totalSavings
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
