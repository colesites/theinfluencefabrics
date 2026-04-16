'use client'

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductRecord } from "@/lib/products";
import { FALLBACK_IMAGE, resolveImageSrc } from "@/lib/image";

type HomeArchiveCardsProps = {
  products: ProductRecord[];
};

export default function HomeArchiveCards({ products }: HomeArchiveCardsProps) {
  const defaultImages = useMemo(() => {
    return Object.fromEntries(
      products.map((product) => [product._id, resolveImageSrc(product.image, FALLBACK_IMAGE)]),
    ) as Record<string, string>;
  }, [products]);

  const [selectedImages, setSelectedImages] =
    useState<Record<string, string>>(defaultImages);
  useEffect(() => {
    setSelectedImages(defaultImages);
  }, [defaultImages]);

  if (products.length === 0) {
    return (
      <div className="md:col-span-2 xl:col-span-3 py-10 bg-transparent flex flex-col items-center justify-center">
        <p className="text-muted-foreground">
          No featured products available in Sanity yet.
        </p>
      </div>
    );
  }

  return (
    <>
      {products.map((product) => {
        const colorVariants =
          product.variants?.filter((variant) => Boolean(variant.colorValue)) ??
          [];
        const hasColorVariants = colorVariants.length > 0;
        const hasDiscount = product.originalPrice > product.price;
        const discountPercent = hasDiscount
          ? Math.round(
              ((product.originalPrice - product.price) / product.originalPrice) *
                100,
            )
          : 0;
        const currentImage = resolveImageSrc(
          selectedImages[product._id] || product.image,
          FALLBACK_IMAGE,
        );

        return (
          <Card
            key={product._id}
            className="overflow-visible border-none bg-transparent shadow-none"
          >
            <Link
              href={`/product/${product._id}`}
              className="relative block aspect-[4/5] overflow-hidden bg-surface-container-highest"
            >
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              />
              {product.badge ? (
                <span className="absolute left-5 top-5 bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                  {product.badge}
                </span>
              ) : null}
              {hasDiscount ? (
                <span className="absolute right-5 top-5 bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                  -{discountPercent}%
                </span>
              ) : null}
            </Link>
            <CardContent className="px-0 pb-1 pt-5">
              <h3 className="text-2xl font-black">
                <Link href={`/product/${product._id}`} className="hover:text-primary">
                  {product.name}
                </Link>
              </h3>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {product.subtitle || "Premium Ankara"}
              </p>

              <div className="mt-4">
                <p className="flex flex-wrap items-baseline gap-3">
                  <span className="font-serif text-3xl font-black">
                    ₦{(product.price || 0).toLocaleString("en-NG")}
                  </span>
                  {product.salePrice && product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through decoration-current">
                      ₦{(product.originalPrice || 0).toLocaleString("en-NG")}
                    </span>
                  )}
                </p>
                <Button asChild variant="outline" className="mt-6 w-full">
                  <Link href={`/product/${product._id}`}>View Details</Link>
                </Button>
                {hasColorVariants && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 px-1 py-1">
                    {colorVariants.map((variant, idx) => {
                      const variantImageSrc = resolveImageSrc(variant.image, "");
                      const isActive =
                        variantImageSrc.length > 0 &&
                        currentImage === variantImageSrc;

                      return (
                        <button
                          key={`${product._id}-${variant._key || idx}`}
                          type="button"
                          onClick={() => {
                            if (variantImageSrc) {
                              setSelectedImages((prev) => ({
                                ...prev,
                                [product._id]: variantImageSrc,
                              }));
                            }
                          }}
                          className={`relative size-5 rounded-full border border-black/20 transition-transform hover:scale-110 ${
                            isActive ? "ring-2 ring-black" : ""
                          }`}
                          style={{ backgroundColor: variant.colorValue || "#d1d5db" }}
                          title={
                            variant.color || variant.colorValue || `Color ${idx + 1}`
                          }
                          aria-label={
                            variant.color || variant.colorValue || `Color ${idx + 1}`
                          }
                        >
                          <span className="sr-only">
                            {variant.color || variant.colorValue || `Color ${idx + 1}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}
