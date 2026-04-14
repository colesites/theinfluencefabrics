import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Star, Truck } from "lucide-react";

import { getProductById, getFeaturedProducts } from "@/lib/products";
import ProductClient from "./ProductClient";
import ProductGallery from "./ProductGallery";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

const placeholderImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuBzwmnxsn94ZIDvFIG5UNKjamTF94T4cUNy_KZwEuI3L34Z3sAchuWNLyIopB0m2AjCPHIEfyCZsYKF4nFAQ_GaBVLmPtNcMpjCagbUXJXNk_wp--q4oV2aCMcUXO3FcFxVpWMkfxH5UFd0cxwUjI0INj-qX0_5xr3ayJ0c9V-4habZZKiZhn1_CJewx8g0vrjMI9QZSWaFpUnPPeH3TT2TQ86jRjGItt_REUsONsArwtGV5DKf4bH1MjLYDWbxhVDPmYfcqUsIaez7";

const reviews = [
  {
    name: "Adejoke K.",
    role: "Verified Buyer",
    initials: "AK",
    text: "The Ankara print quality feels premium and photographs beautifully.",
    rating: 5,
  },
  {
    name: "Marcus L.",
    role: "Designer",
    initials: "ML",
    text: "Great color depth and structure for custom two-piece sets.",
    rating: 5,
  },
  {
    name: "Sarah O.",
    role: "Textile Collector",
    initials: "SO",
    text: "Clean wax lines, rich color, and no fade after wash.",
    rating: 4,
  },
];

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const allProducts = await getFeaturedProducts();
  const relatedProducts = allProducts.filter((item) => item._id !== product._id).slice(0, 3);

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
                <p className="text-sm text-muted-foreground line-through decoration-primary/30">
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

      <section className="bg-surface-container-low py-20 sm:py-24">
        <div className="atelier-shell">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl font-black sm:text-5xl">Ankara Reviews</h2>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-primary">
                What buyers are saying
              </p>
            </div>
            <div className="flex items-end gap-2">
              <p className="font-serif text-6xl font-black leading-none">4.9</p>
              <div className="mb-1 flex text-primary">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-4 fill-current" />
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {reviews.map((review) => (
              <article key={review.name} className="space-y-5">
                <div className="flex text-primary">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`size-4 ${index < review.rating ? "fill-current" : ""}`}
                    />
                  ))}
                </div>
                <p className="font-serif text-lg italic leading-relaxed">{`"${review.text}"`}</p>
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-content-center bg-black text-[10px] font-semibold uppercase tracking-[0.15em] text-white">
                    {review.initials}
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                      {review.name}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {review.role}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="atelier-shell py-20 sm:py-24">
        <h2 className="text-center text-4xl font-black sm:text-5xl">Related Ankara Prints</h2>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {relatedProducts.map((item) => (
            <article key={item._id} className="group relative overflow-hidden bg-surface-container-highest">
              <Link href={`/product/${item._id}`}>
                <div className="relative min-h-[280px]">
                  <Image
                    src={item.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuBzwmnxsn94ZIDvFIG5UNKjamTF94T4cUNy_KZwEuI3L34Z3sAchuWNLyIopB0m2AjCPHIEfyCZsYKF4nFAQ_GaBVLmPtNcMpjCagbUXJXNk_wp--q4oV2aCMcUXO3FcFxVpWMkfxH5UFd0cxwUjI0INj-qX0_5xr3ayJ0c9V-4habZZKiZhn1_CJewx8g0vrjMI9QZSWaFpUnPPeH3TT2TQ86jRjGItt_REUsONsArwtGV5DKf4bH1MjLYDWbxhVDPmYfcqUsIaez7"}
                    alt={item.name}
                    fill
                    className="object-cover grayscale transition-all duration-700 group-hover:grayscale-0"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/70">
                      {item.subtitle || item.collection}
                    </p>
                    <h3 className="mt-2 text-2xl font-black">{item.name}</h3>
                    <div className="mt-2 flex flex-wrap items-baseline gap-2">
                       <p className="font-serif text-lg font-black italic">₦{(item.price || 0).toLocaleString("en-NG")}</p>
                       {item.salePrice && item.originalPrice && (
                         <p className="text-[10px] text-white/50 line-through decoration-white/30">₦{(item.originalPrice || 0).toLocaleString("en-NG")}</p>
                       )}
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
