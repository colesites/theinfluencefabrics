import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  getPaginatedProducts,
  getTotalProductCount,
  getAvailableColors,
  getProducts,
} from "@/lib/products";
import { Search, X } from "lucide-react";

export const revalidate = 0;

type CollectionPageProps = {
  searchParams: Promise<{
    category?: string;
    color?: string;
    page?: string;
    q?: string;
  }>;
};

export default async function CollectionPage({
  searchParams,
}: CollectionPageProps) {
  const { category, color, page, q: query } = await searchParams;
  const currentPage = Number(page) || 1;
  const ITEMS_PER_PAGE = 6;

  const [allProducts, products, totalCount, availableColors] =
    await Promise.all([
      getProducts(),
      getPaginatedProducts({
        category,
        color,
        query,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      }),
      getTotalProductCount(category, color, query),
      getAvailableColors(),
    ]);

  const uniqueCollections = Array.from(
    new Set(allProducts.map((p) => p.collection)),
  ).filter(Boolean);
  const categoriesBase = ["All Archives", ...uniqueCollections];
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const currentCategory = category || "All Archives";
  const isSearchActive = !!query;

  const getUrl = (newParams: {
    category?: string;
    color?: string;
    page?: number | null;
    q?: string | null;
  }) => {
    const params = new URLSearchParams();

    // Preserve Search
    if (newParams.q !== undefined) {
      if (newParams.q) params.set("q", newParams.q);
    } else if (query) {
      params.set("q", query);
    }
    if (newParams.category !== undefined) {
      if (newParams.category && newParams.category !== "All Archives")
        params.set("category", newParams.category);
    } else if (category && category !== "All Archives") {
      params.set("category", category);
    }

    if (newParams.color !== undefined) {
      if (newParams.color) params.set("color", newParams.color);
    } else if (color) {
      params.set("color", color);
    }

    if (newParams.page !== undefined) {
      if (newParams.page && newParams.page > 1)
        params.set("page", String(newParams.page));
    } else if (newParams.page === null) {
      // do nothing
    } else if (currentPage > 1 && !newParams.category && !newParams.color) {
      // reset page on new filter
    }

    return params.toString()
      ? `/collection?${params.toString()}`
      : "/collection";
  };

  return (
    <section className="atelier-shell py-12 sm:py-16">
      <header className="mb-14 sm:mb-20">
        <h1 className="text-5xl leading-none font-black tracking-tight sm:text-7xl lg:text-8xl">
          ANKARA ARCHIVE
        </h1>
        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Welcome to our specially curated collection of authentic wax prints.
            Each piece has been distinctively selected with you in mind—crafted
            to reflect elegance, culture, and individuality. Explore and enjoy
            the beauty, richness, and uniqueness of every print.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              {totalCount} Pieces Found
            </span>
            {isSearchActive && (
              <Link
                href="/collection"
                className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10 text-primary group hover:bg-primary/10 transition-colors"
              >
                <Search className="size-3" />
                <span className="text-[10px] uppercase font-black tracking-widest">
                  Results for: {query}
                </span>
                <X className="size-3 opacity-50 group-hover:opacity-100" />
              </Link>
            )}
            {!isSearchActive && (
              <Button variant="tertiary" className="w-fit">
                Sort by New Arrivals
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="grid gap-12 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16">
        <aside className="space-y-12 lg:sticky lg:top-32 lg:h-fit">
          <div>
            <h2 className="text-3xl font-black">Archive Categories</h2>
            <nav className="mt-7 space-y-3 text-sm uppercase tracking-[0.16em]">
              {categoriesBase.map((item) => (
                <Link
                  key={item}
                  href={getUrl({ category: item, page: null })}
                  className={`block pl-4 transition-all duration-300 ${
                    currentCategory === item
                      ? "border-l-4 border-primary font-semibold text-primary"
                      : "border-l-4 border-transparent text-black/60 hover:text-black hover:border-black/20"
                  }`}
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>

          <div className="border-t border-black/10 pt-8">
            <div className="flex items-center justify-between">
              <p className="editorial-kicker text-black/70">
                Filter by palette
              </p>
              {color && (
                <Link
                  href={getUrl({ color: "" })}
                  className="text-[9px] uppercase tracking-widest opacity-50 hover:opacity-100"
                >
                  Clear
                </Link>
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {availableColors.map((swatch) => (
                <Link
                  key={swatch}
                  href={getUrl({ color: swatch, page: null })}
                  className="size-7 transition-transform hover:scale-110 relative group"
                  style={{
                    backgroundColor: swatch,
                    outline:
                      color === swatch
                        ? "2px solid #000"
                        : "1px solid rgba(0,0,0,0.1)",
                    outlineOffset: "2px",
                  }}
                >
                  <span className="sr-only">{swatch}</span>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[8px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {swatch}
                  </div>
                </Link>
              ))}
              {availableColors.length === 0 && (
                <p className="text-[10px] text-muted-foreground italic">
                  No seasonal colors found.
                </p>
              )}
            </div>
          </div>
        </aside>

        <div>
          <div className="grid gap-x-10 gap-y-16 md:grid-cols-2 lg:gap-y-24">
            {products.length === 0 && (
              <div className="md:col-span-2 py-20 bg-surface-dim flex flex-col items-center justify-center border border-dashed border-black/10">
                <p className="text-muted-foreground font-serif italic">
                  No textiles found matching your search.
                </p>
                <Link
                  href="/collection"
                  className="mt-4 text-xs uppercase tracking-widest text-primary font-bold"
                >
                  Clear All Filters
                </Link>
              </div>
            )}
            {products.map((product, index) => (
              <Card
                key={product._id}
                className={
                  index % 2 === 1
                    ? "bg-transparent md:translate-y-10 border-none shadow-none"
                    : "bg-transparent border-none shadow-none"
                }
              >
                <Link
                  href={`/product/${product._id}`}
                  className="group relative block aspect-[4/5] overflow-hidden bg-surface-container-highest"
                >
                  <Image
                    src={
                      product.image ||
                      "https://lh3.googleusercontent.com/aida-public/placeholder-image"
                    }
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-4 right-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    Details
                  </Button>
                </Link>
                <CardContent className="px-0 pb-0 pt-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-3xl font-black">
                        <Link
                          href={`/product/${product._id}`}
                          className="hover:text-primary"
                        >
                          {product.name}
                        </Link>
                      </h3>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        {product.collection}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-serif text-3xl font-black">
                        ₦{product.price.toLocaleString("en-NG")}
                      </span>
                      {product.salePrice && (
                        <span className="text-[11px] text-muted-foreground line-through decoration-primary/30">
                          ₦{product.originalPrice.toLocaleString("en-NG")}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <PaginationRoot className="mt-32">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={
                      currentPage > 1 ? getUrl({ page: currentPage - 1 }) : "#"
                    }
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-30" : ""
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href={getUrl({ page: i + 1 })}
                      isActive={currentPage === i + 1}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href={
                      currentPage < totalPages
                        ? getUrl({ page: currentPage + 1 })
                        : "#"
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-30"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </PaginationRoot>
          )}
        </div>
      </div>
    </section>
  );
}
