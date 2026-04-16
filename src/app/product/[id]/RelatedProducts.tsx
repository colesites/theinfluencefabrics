'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ProductRecord } from '@/lib/products'
import { FALLBACK_IMAGE, resolveImageSrc } from '@/lib/image'

type RelatedProductsProps = {
  products: ProductRecord[]
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  const defaultImages = useMemo(() => {
    return Object.fromEntries(
      products.map((item) => [item._id, resolveImageSrc(item.image, FALLBACK_IMAGE)]),
    ) as Record<string, string>
  }, [products])

  const [selectedImages, setSelectedImages] = useState<Record<string, string>>(defaultImages)

  useEffect(() => {
    setSelectedImages(defaultImages)
  }, [defaultImages])

  return (
    <div className="mt-12 grid gap-5 md:grid-cols-3">
      {products.map((item) => {
        const hasDiscount = item.originalPrice > item.price
        const discountPercent = hasDiscount
          ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
          : 0

        const currentImage = resolveImageSrc(selectedImages[item._id] || item.image, FALLBACK_IMAGE)

        return (
          <article key={item._id} className="group relative overflow-hidden border border-black/10 bg-white">
            <Link href={`/product/${item._id}`}>
              <div className="relative min-h-[280px]">
                <Image
                  src={currentImage}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {hasDiscount ? (
                  <span className="absolute right-4 top-4 bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                    -{discountPercent}%
                  </span>
                ) : null}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-6 text-white">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/70">
                    {item.subtitle || item.collection}
                  </p>
                  <h3 className="mt-2 text-2xl font-black">{item.name}</h3>
                  <div className="mt-2 flex flex-wrap items-baseline gap-2">
                    <p className="font-serif text-lg font-black italic">₦{(item.price || 0).toLocaleString("en-NG")}</p>
                    {item.salePrice && item.originalPrice && (
                      <p className="text-sm text-white/60 line-through decoration-current">
                        ₦{(item.originalPrice || 0).toLocaleString("en-NG")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Link>

            {item.variants && item.variants.some((v) => v.colorValue) && (
              <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-white/90 px-2 py-1 backdrop-blur">
                {item.variants.map((variant, idx) => {
                  const variantImageSrc = resolveImageSrc(variant.image, '')
                  const isActive = variantImageSrc.length > 0 && currentImage === variantImageSrc
                  return (
                  <button
                    key={`${item._id}-${variant._key || idx}`}
                    type="button"
                    onClick={() => {
                      if (variantImageSrc) {
                        setSelectedImages((prev) => ({ ...prev, [item._id]: variantImageSrc }))
                      }
                    }}
                    className={`relative size-4 rounded-full border border-black/20 transition-transform hover:scale-110 ${
                      isActive ? 'ring-2 ring-black ring-offset-1' : ''
                    }`}
                    style={{ backgroundColor: variant.colorValue || '#d1d5db' }}
                    title={variant.color || variant.colorValue || `Variant ${idx + 1}`}
                    aria-label={variant.color || variant.colorValue || `Variant ${idx + 1}`}
                  >
                    <span className="sr-only">{variant.color || variant.colorValue || `Variant ${idx + 1}`}</span>
                  </button>
                  )
                })}
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}
