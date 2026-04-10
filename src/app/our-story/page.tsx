import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const storyMilestones = [
  {
    year: "2018",
    title: "Ankara Archive Began",
    text: "Influencefabrics began by collecting bold Ankara prints from artisan communities across West Africa.",
  },
  {
    year: "2021",
    title: "Signature Print Drops",
    text: "We launched curated Ankara bundles with richer dyes, cleaner repeats, and limited seasonal patterns.",
  },
  {
    year: "2024",
    title: "Custom Ankara Cuts",
    text: "Clients began ordering made-to-measure Ankara yardage and tailored sets through our bespoke workflow.",
  },
];

export default function OurStoryPage() {
  return (
    <>
      <section className="bg-surface-dim">
        <div className="grid md:grid-cols-2">
          <article className="order-2 flex flex-col justify-center px-6 py-16 sm:px-12 sm:py-20 md:order-1 md:py-24 lg:px-20 xl:px-32">
            <p className="editorial-kicker text-primary">Our Story</p>
            <h1 className="mt-6 max-w-xl text-4xl leading-tight font-black sm:text-5xl lg:text-6xl xl:text-7xl">
              Influencefabrics is where Ankara heritage meets sharp modern form.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-8 sm:text-lg">
              We partner with master textile makers to source high-character Ankara prints, then curate
              them in an editorial system built for contemporary wardrobes.
            </p>
            <Button asChild size="lg" className="mt-8 w-fit sm:mt-10">
              <Link href="/collection">Explore Collection</Link>
            </Button>
          </article>

          <article className="relative order-1 min-h-[300px] w-full sm:min-h-[400px] md:order-2 md:min-h-full">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUUV1HM8rN-KGSjpupdr1lyip7V2cvIfTn263cAVyTy2l4wZnacbkQy1MwfAk8oqsvgT0ItqukKGTlmvPaxPjeqyK0tiGUORb7ChD1lx9gF1ZeHxkdA0a-jy9r2I_OLQ_5qgAd-E1nAw6a6jicWULjznGdprEX3ekyNfE4zPelFU9z5WCy2fMdngLICGeS9kTV58q3mRfEhe5cKn7Bq2lNmQ_MSvLLIo57J1PiEJ-yBrmis8dFmfYpIlpOP-6adQ3b33oT7uwzQNFe"
            alt="Influencefabrics textile showcase"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          </article>
        </div>
      </section>

      <section className="atelier-shell py-20 sm:py-24">
        <div className="mb-12">
          <p className="editorial-kicker text-primary">Milestones</p>
          <h2 className="mt-4 text-4xl font-black sm:text-5xl">The evolution of our Ankara house.</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {storyMilestones.map((item) => (
            <Card key={item.year} className="bg-surface-container-low">
              <CardContent className="p-8">
                <p className="editorial-kicker text-primary">{item.year}</p>
                <h3 className="mt-4 text-3xl font-black">{item.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
