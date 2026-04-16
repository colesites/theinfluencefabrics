import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Star, Truck } from "lucide-react";

import { getProductById, getFeaturedProducts } from "@/lib/products";
import { getTestimonialsByProductId } from "@/lib/testimonials";
import { resolveImageSrc } from "@/lib/image";
import ProductClient from "./ProductClient";
import ProductGallery from "./ProductGallery";
import ProductTestimonials from "./ProductTestimonials";
import RelatedProducts from "./RelatedProducts";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

const placeholderImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuBzwmnxsn94ZIDvFIG5UNKjamTF94T4cUNy_KZwEuI3L34Z3sAchuWNLyIopB0m2AjCPHIEfyCZsYKF4nFAQ_GaBVLmPtNcMpjCagbUXJXNk_wp--q4oV2aCMcUXO3FcFxVpWMkfxH5UFd0cxwUjI0INj-qX0_5xr3ayJ0c9V-4habZZKiZhn1_CJewx8g0vrjMI9QZSWaFpUnPPeH3TT2TQ86jRjGItt_REUsONsArwtGV5DKf4bH1MjLYDWbxhVDPmYfcqUsIaez7";

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const allProducts = await getFeaturedProducts();
  const relatedProducts = allProducts.filter((item) => item._id !== product._id).slice(0, 3);
  const testimonials = await getTestimonialsByProductId(product._id);

  return (
    <>
      <div className="bg-surface-dim py-4">
        <div className="atelier-shell">
          <nav className="text-[10px] uppercase tracking-[0.18em] text-black/50">
            <Link href="/collection" className="hover:text-black">
              Collection
            </Link>
            <span className="mx-2">/</span>
            <span className="text-black">{product.name}</span>
          </nav>
        </div>
      </div>

      <section className="grid lg:grid-cols-12">
        <ProductGallery 
          productName={product.name}
          mainImage={product.image || placeholderImage}
          gallery={product.gallery || []}
          initialVariantImage={resolveImageSrc(product.variants?.[0]?.image, "") || null}
          variantImages={
            product.variants
              ?.map((variant) => resolveImageSrc(variant.image, ""))
              .filter((img) => img.length > 0) || []
          }
        />

        <div className="bg-surface p-7 sm:p-10 lg:col-span-5 lg:p-14">
          <div className="lg:sticky lg:top-32">
            <p className="editorial-kicker text-primary">New Arrivals / Premium Edition</p>
            <h1 className="mt-4 text-4xl leading-tight font-black sm:text-5xl lg:text-6xl">
              {product.name}
            </h1>
            <div className="mt-5 flex flex-wrap items-baseline gap-4">
              <p className="font-serif text-4xl font-black text-primary">₦{(product.price || 0).toLocaleString("en-NG")}</p>
              {product.salePrice && product.originalPrice && (
                <p className="text-base text-muted-foreground line-through decoration-current">
                  ₦{(product.originalPrice || 0).toLocaleString("en-NG")}
                </p>
              )}
            </div>

            <div className="mt-10 space-y-7">
              <div className="border-b border-black/10 pb-6">
                <p className="editorial-kicker text-black/70">Description</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {product.description || 'No description provided.'}
                </p>
              </div>
            </div>

            <ProductClient product={product} />

            <div className="mt-10 space-y-4 text-[11px] uppercase tracking-[0.16em]">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-4 text-primary" /> Textile Care & Dimensions
              </div>
              <div className="flex items-center gap-3">
                <Truck className="size-4 text-primary" /> Worldwide Shipping
              </div>
              {product.variants && product.variants[0]?.color && (
                <div className="flex items-center gap-3">
                  <Star className="size-4 text-primary" /> Colorway: {product.variants[0].color}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <ProductTestimonials productId={product._id} initialTestimonials={testimonials} />

      <section className="atelier-shell py-20 sm:py-24">
        <h2 className="text-center text-4xl font-black sm:text-5xl">Related Ankara Prints</h2>
        <RelatedProducts products={relatedProducts} />
      </section>
    </>
  );
}
