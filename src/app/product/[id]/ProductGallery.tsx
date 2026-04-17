'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ProductLightbox } from '@/components/ProductLightbox'
import { FALLBACK_IMAGE, normalizeImageList, resolveImageSrc } from '@/lib/image'

interface ProductGalleryProps {
  productName: string
  mainImage: string
  gallery: string[]
  initialVariantImage?: string | null
  variantImages?: string[]
}

export default function ProductGallery({
  productName,
  mainImage,
  gallery,
  initialVariantImage,
  variantImages = [],
}: ProductGalleryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [variantImage, setVariantImage] = useState<string | null>(
    resolveImageSrc(initialVariantImage || '', '') || null,
  )

  const normalizedMainImage = resolveImageSrc(mainImage, FALLBACK_IMAGE)
  const baseImages = normalizeImageList([normalizedMainImage, ...(gallery || [])], normalizedMainImage)
  const normalizedVariantImages = normalizeImageList(variantImages, '')
  const combinedImages = normalizeImageList(
    [...normalizedVariantImages, ...baseImages],
    normalizedMainImage,
  )
  const displayImages = variantImage
    ? [variantImage, ...combinedImages.filter((img) => img !== variantImage)]
    : combinedImages
  const safeActiveImageIndex =
    displayImages.length > 0 ? Math.min(activeImageIndex, displayImages.length - 1) : 0

  const openLightbox = (index: number) => {
    setPhotoIndex(index)
    setIsOpen(true)
  }

  // Visual Sync: Listen for variant changes
  useEffect(() => {
    const handleVariantChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ image: string }>;
      const normalizedVariantImage = resolveImageSrc(customEvent.detail?.image, '')
      if (normalizedVariantImage) {
        setVariantImage(normalizedVariantImage)
        setActiveImageIndex(0)
      }
    }
    window.addEventListener('variant-change', handleVariantChange)
    return () => window.removeEventListener('variant-change', handleVariantChange)
  }, [])

  return (
    <div className="space-y-8 bg-surface-dim p-4 sm:p-8 lg:col-span-7 lg:p-12">
      <div 
        className="relative aspect-[4/5] overflow-hidden bg-surface-container-highest cursor-zoom-in"
        onClick={() => openLightbox(safeActiveImageIndex)}
      >
        <Image
          src={displayImages[safeActiveImageIndex] || displayImages[0]}
          alt={productName}
          fill
          className="object-cover transition-transform duration-500 hover:scale-[1.02]"
          sizes="(max-width: 1024px) 100vw, 58vw"
          priority
          key={displayImages[safeActiveImageIndex] || displayImages[0]}
        />
      </div>

      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {displayImages.map((img, index) => (
            <button
              key={`${img}-${index}`}
              type="button"
              onClick={() => setActiveImageIndex(index)}
              className={`relative aspect-square overflow-hidden border transition-colors ${
                safeActiveImageIndex === index ? 'border-black' : 'border-black/10 hover:border-black/40'
              }`}
            >
              <Image
                src={img}
                alt={`${productName} view ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 25vw, 14vw"
              />
            </button>
          ))}
        </div>
      )}

      <ProductLightbox 
        images={displayImages}
        initialIndex={photoIndex}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  )
}
