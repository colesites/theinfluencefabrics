'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { FALLBACK_IMAGE, normalizeImageList } from '@/lib/image'

interface ProductLightboxProps {
  images: string[]
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
}

export function ProductLightbox({ images, initialIndex = 0, isOpen, onClose }: ProductLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [mounted, setMounted] = useState(false)
  const safeImages = normalizeImageList(images, FALLBACK_IMAGE)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % safeImages.length)
  }, [safeImages.length])

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length)
  }, [safeImages.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'auto'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose, nextImage, prevImage])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm transition-all duration-300">
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 text-white/70 hover:text-white transition-colors z-50 p-2"
        aria-label="Close Lightbox"
      >
        <X className="size-8 stroke-[1.5]" />
      </button>

      {safeImages.length > 1 && (
        <>
          <button 
            onClick={prevImage}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-4"
          >
            <ChevronLeft className="size-10 stroke-[1.5]" />
          </button>
          <button 
            onClick={nextImage}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-4"
          >
            <ChevronRight className="size-10 stroke-[1.5]" />
          </button>
        </>
      )}

      <div className="relative w-full h-full max-w-6xl max-h-[85vh] p-4 flex flex-col items-center justify-center">
        <div className="relative w-full h-full">
          <Image
            src={safeImages[currentIndex] || safeImages[0]}
            alt={`Product view ${currentIndex + 1}`}
            fill
            className="object-contain"
            priority
            quality={100}
          />
        </div>
        <div className="mt-8 text-white/40 text-[10px] uppercase tracking-[0.2em] font-medium">
          {currentIndex + 1} / {safeImages.length} — Archives Edition
        </div>
      </div>
    </div>,
    document.body
  )
}
