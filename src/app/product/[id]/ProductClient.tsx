'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ProductRecord, ProductVariant } from '@/lib/products'
import { useCart } from '@/components/cart/CartContext'

export default function ProductClient({ product }: { product: ProductRecord }) {
  const { addToCart } = useCart()
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] || { quantity: 100 }
  )

  const handleVariantSelect = (v: ProductVariant) => {
    setSelectedVariant(v)
    if (v.image) {
      window.dispatchEvent(new CustomEvent('variant-change', { detail: { image: v.image } }))
    }
  }

  const isOutOfStock = selectedVariant ? selectedVariant.quantity <= 0 : false

  const handleAddToCart = () => {
    if (isOutOfStock) return
    
    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: selectedVariant?.image || product.image,
      size: selectedVariant?.size,
      color: selectedVariant?.color,
      yards: selectedVariant?.yards,
      maxStock: selectedVariant?.quantity || 100,
      quantity: 1
    })
  }

  return (
    <div className="mt-10 space-y-7">
      {product.variants && product.variants.length > 0 && (
        <div>
          <p className="editorial-kicker text-black/70">Select Edition</p>
          <div className="mt-4 grid grid-cols-1 gap-3">
            {product.variants.map((v, idx) => (
              <Button
                key={idx}
                variant={selectedVariant === v ? 'default' : 'outline'}
                className="h-auto flex flex-col items-start justify-center p-4 text-left gap-1 transition-all duration-300"
                onClick={() => handleVariantSelect(v)}
              >
                <div className="flex justify-between w-full items-center">
                  <div className="flex items-center gap-3">
                    {v.colorValue && (
                      <span 
                        className="size-4 rounded-full border border-black/10 shrink-0" 
                        style={{ backgroundColor: v.colorValue }}
                      />
                    )}
                    <span className="font-bold">{v.color || v.colorValue || 'Universal'} {v.size || ''}</span>
                  </div>
                  <span className="text-[10px] uppercase opacity-60 tracking-wider transition-opacity">{v.yards || 'Standard Length'}</span>
                </div>
                {v.quantity <= 5 && v.quantity > 0 && (
                  <span className="text-[9px] text-amber-600 uppercase tracking-[0.16em] font-semibold mt-1">Last {v.quantity} Units</span>
                )}
                {v.quantity <= 0 && (
                  <span className="text-[9px] text-destructive uppercase tracking-[0.16em] font-semibold mt-1">Sold Out</span>
                )}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 space-y-3">
        <Button 
          size="lg" 
          className="w-full" 
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add To Cart'}
        </Button>
        <Button size="lg" variant="secondary" className="w-full">
          Pre-Order Bespoke Fit
        </Button>
      </div>
    </div>
  )
}
