'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ProductRecord, ProductVariant } from '@/lib/products'
import { useCart } from '@/components/cart/CartContext'
import { resolveImageSrc } from '@/lib/image'

export default function ProductClient({ product }: { product: ProductRecord }) {
  const router = useRouter()
  const { addToCart } = useCart()
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] || { quantity: 100 }
  )

  const formatYards = (yards?: string) => {
    if (!yards) return 'Standard Length'
    const trimmed = yards.trim()
    if (/yd|yard/i.test(trimmed)) return trimmed
    return `${trimmed} yds`
  }

  const handleVariantSelect = (v: ProductVariant) => {
    setSelectedVariant(v)
    const nextImage = resolveImageSrc(v.image, '')
    const fallbackImage = resolveImageSrc(product.image, '')
    window.dispatchEvent(
      new CustomEvent('variant-change', {
        detail: { image: nextImage || fallbackImage },
      }),
    )
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

  const handleBuyNow = () => {
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
    }, { openCart: false })
    router.push('/checkout')
  }

  return (
    <div className="mt-10 space-y-7">
      {product.variants && product.variants.length > 0 && (
        <div>
          <p className="editorial-kicker text-black/70">Select Edition</p>
          <div className="mt-4 grid grid-cols-1 gap-3">
            {product.variants.map((v, idx) => (
              <button
                key={idx}
                type="button"
                className={`h-auto flex w-full flex-col items-start justify-center gap-1 p-4 text-left transition-all duration-300 border ${
                  selectedVariant === v
                    ? 'border-black bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)]'
                    : 'border-black/15 bg-transparent hover:border-black/40'
                }`}
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
                  <span className="text-[10px] uppercase opacity-60 tracking-wider transition-opacity">{formatYards(v.yards)}</span>
                </div>
                {v.quantity <= 5 && v.quantity > 0 && (
                  <span className="mt-1 text-[9px] uppercase tracking-[0.16em] font-semibold text-black/70">
                    Last {v.quantity} units
                  </span>
                )}
                {v.quantity <= 0 && (
                  <span className="text-[9px] text-destructive uppercase tracking-[0.16em] font-semibold mt-1">Sold Out</span>
                )}
              </button>
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
        <Button
          size="lg"
          variant="secondary"
          className="w-full"
          onClick={handleBuyNow}
          disabled={isOutOfStock}
        >
          Buy Now
        </Button>
      </div>
    </div>
  )
}
