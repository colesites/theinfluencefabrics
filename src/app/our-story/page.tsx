import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function OurStoryPage() {
  return (
    <>
      <section className="bg-surface-dim">
        <div className="grid md:grid-cols-2">
          <article className="order-2 flex flex-col justify-center px-6 py-16 sm:px-12 sm:py-20 md:order-1 md:py-24 lg:px-20 xl:px-32">
            <p className="editorial-kicker text-primary">Our Story</p>
            <h1 className="mt-6 max-w-xl text-4xl leading-tight font-black sm:text-5xl lg:text-6xl xl:text-7xl">
              A fashion house born out of a passion for beauty.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-8 sm:text-lg">
              Influence Fabrics is a registered fashion house founded on April
              7th, 2024, born out of a passion to bring beautiful, trendy Ankara
              prints to the vibrant city of Ado-Ekiti—and to share that beauty
              with the world.
            </p>
            <Button asChild size="lg" className="mt-8 w-fit sm:mt-10">
              <Link href="/collection">Explore Collection</Link>
            </Button>
          </article>

          <article className="relative order-1 min-h-[300px] w-full sm:min-h-[400px] md:order-2 md:min-h-full">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUUV1HM8rN-KGSjpupdr1lyip7V2cvIfTn263cAVyTy2l4wZnacbkQy1MwfAk8oqsvgT0ItqukKGTlmvPaxPjeqyK0tiGUORb7ChD1lx9gF1ZeHxkdA0a-jy9r2I_OLQ_5qgAd-E1nAw6a6jicWULjznGdprEX3ekyNfE4zPelFU9z5WCy2fMdngLICGeS9kTV58q3mRfEhe5cKn7Bq2lNmQ_MSvLLIo57J1PiEJ-yBrmis8dFmfYpIlpOP-6adQ3b33oT7uwzQNFe"
              alt="Influence fabrics textile showcase"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </article>
        </div>
      </section>

      <section className="atelier-shell py-20 sm:py-32">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <p className="editorial-kicker text-primary">The Journey</p>
            <h2 className="mt-4 text-4xl font-black sm:text-5xl">
              Driven by purpose and cultural expression.
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
              What started with just a few carefully selected Ankara pieces in
              100%, 80%, and 50% cotton has grown into a brand driven by
              purpose, style, and cultural expression. Through consistency,
              dedication, and a deep love for unique designs, Influence Fabrics
              has steadily evolved into a trusted source for quality Ankara
              prints.
            </p>
          </div>

          <div className="flex flex-col justify-center bg-surface-container-low p-8 sm:p-12">
            <p className="editorial-kicker text-primary">Our Mission</p>
            <h2 className="mt-2 text-3xl font-black italic sm:text-4xl">
              Celebrating heritage through style.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Today, our mission remains the same: to see individuals
              confidently express themselves through distinctive and beautiful
              Ankara fabrics that stand out, tell stories, and celebrate
              heritage, unique individual personality, and beauty.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
