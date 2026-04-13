import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getExploreItems } from "@/lib/explore";

export const revalidate = 0;

export default async function ExplorePage() {
  const items = await getExploreItems();

  return (
    <div className="min-h-screen bg-background">
      {/* Header section */}
      <section className="atelier-shell pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-4xl">
          <p className="editorial-kicker text-primary mb-6">Discovery</p>
          <h1 className="text-6xl font-black font-serif italic leading-[0.9] sm:text-7xl lg:text-9xl uppercase">
            Explore <br />
            The Archive
          </h1>
          <p className="mt-8 max-w-xl text-lg text-muted-foreground leading-relaxed">
            A curated feed of fabric stories, heritage moments, and behind-the-scenes glimpses into the craft of Influence Fabrics.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="atelier-shell pb-32">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center border-t border-border">
            <div className="size-16 bg-surface-container rounded-full flex items-center justify-center mb-6">
              <Compass className="size-8 text-muted-foreground/40" />
            </div>
            <h2 className="text-2xl font-black mb-3">Nothing here yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-10">
              We&apos;re currently preparing our first set of stories. Check back soon for our latest journal entries and fabric explorations.
            </p>
            <Button asChild variant="outline">
              <Link href="/collection">Shop Collection</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-32">
            {items.map((item, index) => (
              <article 
                key={item._id} 
                className={`grid gap-12 items-center md:grid-cols-2 ${
                  index % 2 !== 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className={`relative aspect-[4/5] overflow-hidden bg-surface-container ${
                  index % 2 !== 0 ? 'md:order-2' : ''
                }`}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-1000 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute top-8 left-8 mix-blend-difference text-white/40 editorial-kicker">
                    {new Date(item._createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
                
                <div className={`space-y-8 ${
                  index % 2 !== 0 ? 'md:order-1' : ''
                }`}>
                  <div className="space-y-4">
                    <p className="editorial-kicker text-primary">Moment {items.length - index}</p>
                    <h2 className="text-4xl font-black sm:text-5xl lg:text-6xl leading-tight">
                      {item.title}
                    </h2>
                  </div>
                  
                  <div className="h-px w-24 bg-primary" />
                  
                  <p className="text-lg leading-relaxed text-muted-foreground max-w-lg whitespace-pre-wrap">
                    {item.content}
                  </p>
                  
                  <div className="pt-4">
                    <Button asChild variant="tertiary" className="group">
                      <Link href="/collection">
                        Shop Related Pieces
                        <ArrowRight className="size-4 ml-2 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Footer CTA */}
      {items.length > 0 && (
        <section className="bg-surface-dim py-32">
          <div className="atelier-shell text-center">
            <h2 className="text-5xl font-black mb-10 max-w-2xl mx-auto sm:text-6xl">
              Bring the archive into your story.
            </h2>
            <Button asChild size="lg" className="h-16 px-10">
              <Link href="/collection">Explore All Fabrics</Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
