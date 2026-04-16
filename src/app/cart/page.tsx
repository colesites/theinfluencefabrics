'use client'

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react'

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/components/cart/CartContext";
import { FALLBACK_IMAGE, resolveImageSrc } from "@/lib/image";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, cartTotal } = useCart()

  if (items.length === 0) {
    return (
      <section className="atelier-shell py-28 text-center">
        <div className="max-w-md mx-auto space-y-8">
          <ShoppingBag className="size-20 mx-auto text-muted-foreground opacity-20" />
          <h1 className="text-5xl font-black font-serif italic">Your cart is empty.</h1>
          <p className="text-muted-foreground leading-relaxed">
            Discover our collection of premium Ankara fabrics and modern heritage textiles.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/collection">Browse Collection</Link>
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="atelier-shell py-14 sm:py-20">
      <header className="mb-12 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="editorial-kicker text-primary">Cart</p>
          <h1 className="mt-4 text-5xl font-black sm:text-7xl">Your Ankara Selection</h1>
        </div>
        <Button asChild variant="tertiary" className="w-fit">
          <Link href="/collection">Continue Shopping</Link>
        </Button>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
        <Card className="bg-surface-container-low border-none shadow-none">
          <CardContent className="space-y-8 p-0">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}-${item.yards}`} className="flex gap-5 border-b border-black/10 pb-8 last:border-b-0 last:pb-0">
                <div className="relative h-32 w-24 shrink-0 bg-surface-container-highest sm:h-40 sm:w-32 overflow-hidden">
                  <Image src={resolveImageSrc(item.image, FALLBACK_IMAGE)} alt={item.name} fill className="object-cover" sizes="150px" />
                </div>
                <div className="flex flex-1 flex-col justify-between py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-black font-serif">{item.name}</h2>
                      <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {item.size || 'Standard'} {item.color ? `/ ${item.color}` : ''} {item.yards ? `/ ${item.yards} yds` : ''}
                      </p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.productId, item.size, item.color, item.yards)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-border bg-background">
                      <button 
                         onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size, item.color, item.yards)}
                         className="p-3 hover:bg-black/5"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="px-4 text-sm font-black">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size, item.color, item.yards)}
                        className="p-3 hover:bg-black/5"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                    <p className="font-serif text-2xl font-black text-primary">₦{(Number(item.price) || 0).toLocaleString("en-NG")}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="h-fit bg-surface-container-high border-none shadow-none">
          <CardContent className="p-7 sm:p-10">
            <h2 className="text-3xl font-black font-serif italic">Order Summary</h2>

            <div className="mt-10 space-y-5 text-sm uppercase tracking-[0.18em]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-black">₦{(cartTotal || 0).toLocaleString("en-NG")}</span>
              </div>
              <div className="flex justify-between border-b border-black/10 pb-6">
                <span className="text-muted-foreground">Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between pt-2 text-xl font-black tracking-tight text-primary">
                <span>Total</span>
                <span>₦{(cartTotal || 0).toLocaleString("en-NG")}</span>
              </div>
            </div>

            <div className="mt-10">
              <label htmlFor="coupon" className="editorial-kicker block text-black/70 mb-3">
                Promo Code
              </label>
              <div className="flex gap-2">
                <Input id="coupon" placeholder="INFLUENCE10" className="bg-background border-border" />
                <Button variant="secondary">Apply</Button>
              </div>
            </div>

            <Button asChild size="lg" className="mt-10 w-full h-14 text-base font-black tracking-widest uppercase">
              <Link href="/checkout">Proceed To Checkout</Link>
            </Button>
            
            <p className="mt-6 text-center text-[10px] text-muted-foreground uppercase tracking-widest">
              Secure checkout verified by Paystack
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
