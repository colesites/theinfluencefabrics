'use client'

import React from 'react'
import { ThemeProvider } from 'next-themes'
import { CartProvider } from '@/components/cart/CartContext'

// Suppress the React 19 warning for next-themes script tag in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const orig = console.error;
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag')) {
      return;
    }
    orig.apply(console, args);
  };
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <CartProvider>
        {children}
      </CartProvider>
    </ThemeProvider>
  )
}
