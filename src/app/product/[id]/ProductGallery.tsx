'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ProductLightbox } from '@/components/ProductLightbox'

interface ProductGalleryProps {
  productName: string
  mainImage: string
  gallery: string[]
}

export default function ProductGallery({ productName, mainImage, gallery }: ProductGalleryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [variantImage, setVariantImage] = useState<string | null>(null)

  const baseImages = gallery.length > 0 ? gallery : [mainImage]
  const displayImages = variantImage 
    ? [variantImage, ...baseImages.filter(img => img !== variantImage)]
    : baseImages

  const openLightbox = (index: number) => {
    setPhotoIndex(index)
    setIsOpen(true)
  }

  // Visual Sync: Listen for variant changes
  useEffect(() => {
    const handleVariantChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ image: string }>;
      if (customEvent.detail?.image) {
        setVariantImage(customEvent.detail.image)
        setPhotoIndex(0)
      }
    }
    window.addEventListener('variant-change', handleVariantChange)
    return () => window.removeEventListener('variant-change', handleVariantChange)
  }, [])

  return (
    <div className="space-y-8 bg-surface-dim p-4 sm:p-8 lg:col-span-7 lg:p-12">
      <div 
        className="relative aspect-[4/5] overflow-hidden bg-surface-container-highest cursor-zoom-in"
        onClick={() => openLightbox(0)}
      >
        <Image
          src={displayImages[0]}
          alt={productName}
          fill
          className="object-cover transition-transform duration-500 hover:scale-[1.02]"
          sizes="(max-width: 1024px) 100vw, 58vw"
          priority
          key={displayImages[0]}
        />
      </div>

      {displayImages.length > 2 && (
        <div className="grid grid-cols-2 gap-6">
          <div 
            className="relative aspect-square overflow-hidden bg-surface-container-highest cursor-zoom-in"
            onClick={() => openLightbox(1)}
          >
            <Image
              src={displayImages[1]}
              alt={`${productName} view 2`}
              fill
              className="object-cover transition-transform duration-500 hover:scale-[1.02]"
              sizes="(max-width: 1024px) 50vw, 28vw"
            />
          </div>
          <div 
            className="relative aspect-square overflow-hidden bg-surface-container-highest cursor-zoom-in"
            onClick={() => openLightbox(2)}
          >
            <Image
              src={displayImages[2]}
              alt={`${productName} view 3`}
              fill
              className="object-cover transition-transform duration-500 hover:scale-[1.02]"
              sizes="(max-width: 1024px) 50vw, 28vw"
            />
          </div>
        </div>
      )}

      {displayImages.length > 3 && (
        <div 
          className="relative aspect-[16/9] overflow-hidden bg-surface-container-highest cursor-zoom-in"
          onClick={() => openLightbox(3)}
        >
          <Image
            src={displayImages[3]}
            alt={`${productName} view 4`}
            fill
            className="object-cover transition-transform duration-500 hover:scale-[1.02]"
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
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
