import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getFeaturedProducts } from "@/lib/products";
import HomeArchiveCards from "./HomeArchiveCards";

export const revalidate = 0;

export default async function Home() {
  const homeProducts = await getFeaturedProducts();
  return (
    <>
      <section className="relative flex h-[calc(100svh-7rem)] items-center overflow-hidden bg-surface-dim lg:h-[calc(100svh-5rem)]">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>

        <div className="atelier-shell relative z-10 py-16">
          <h1
            className="mt-6 text-5xl leading-[0.9] text-white font-poppins font-bold tracking-tight sm:text-7xl lg:text-9xl uppercase"
            style={{ textShadow: "0 8px 28px rgba(0,0,0,0.45)" }}
          >
            Influence <br />
            Fabrics
          </h1>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/account/sign-up">Sign Up</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/collection">Shop Collection</Link>
            </Button>
          </div>

          <p
            className="mt-16 max-w-sm text-right font-serif text-xl italic lg:ml-auto text-white"
            style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
          >
            {`"Premium Ankara fabrics crafted for modern elegance and timeless African style."`}
          </p>
        </div>
      </section>

      <section className="atelier-shell py-20 sm:py-28">
        <div className="grid gap-4 md:grid-cols-12 md:grid-rows-2">
          <article className="relative overflow-hidden bg-surface-container md:col-span-8 md:row-span-2">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrlpODtcy4wZ5AH9XgV8l5FlgzKGJuVHAwzqK7JyoDJmkgF_20qrNl3AXvl0wCXLDloWM6RSlG_SllVDcQio5Q6pKlhTVG4f3w_M3J07HnfbgQYXC1_PimILS0xen-mTyCwFqoFE8zhX1f8jgocJsoGQpeIDXRVDda1xSazGxQUQCpvmdpsJQ0t-0VQ5fesUGOgm-DVdTiCtA4lxg5QHL4x9ngUow5tbOO11Dm3ykhmSeIa6d9kYB0Fp5V5zPOqbQecffXPG0yeR9q"
              alt="Ankara textiles"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-10 text-white">
              <h2 className="text-4xl font-black">Ankara Textiles</h2>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/80">
                Shop Signature Prints
              </p>
            </div>
          </article>

          <article className="relative overflow-hidden bg-surface-container-high md:col-span-4">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEIIqzPrOVbUuEyJiqFkk7C-1Is6A0V-IBywt31XQerVJVhNoQz45TJ8sJzVcW-LjknUc5U2fEdy0Xp_OYgdXJIYmRH2-DZ29x91Jg0M_RtAn9iD432mOjbRVwUePmJgqzvRfPNsPwJWU0YLphBVTBfQS3iGzRwtF-SF1SqgAAUjwkHL3fUjUoU6Gf_5DF1SCMWTPTXM2oOqnErnfTOyyBwZhz3LXsMGsCAujokiGo1h1tNzt18VrAOYe1SHAX_C_pRV3z2jypBiVN"
              alt="Ankara weave details"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
            <div className="absolute inset-0 grid place-content-center bg-black/30">
              <h3 className="text-3xl font-black text-white">Ankara Weaves</h3>
            </div>
          </article>

          <article className="flex flex-col justify-end bg-primary p-8 text-primary-foreground md:col-span-4">
            <p className="editorial-kicker text-white/80">Custom Cut</p>
            <h3 className="mt-3 text-3xl font-black">Ankara By Yard</h3>
            <p className="mt-3 max-w-xs text-sm text-white/85">
              Order authentic Ankara fabrics in 6-yard, 12-yard, or custom-cut
              bundles.
            </p>
            <Button
              asChild
              variant="tertiary"
              className="mt-8 w-fit text-white decoration-white hover:text-white hover:opacity-80"
            >
              <Link href="/contact">Request Bundle</Link>
            </Button>
          </article>
        </div>
      </section>

      <section className="bg-surface-container-low py-20 sm:py-28">
        <div className="atelier-shell px-4 sm:px-6">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-8">
            <div>
              <h2 className="text-5xl font-black sm:text-6xl">
                Ankara Archive
              </h2>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Curated prints / premium wax textiles
              </p>
            </div>
            <Button asChild variant="tertiary" className="w-fit">
              <Link href="/collection">See all pieces</Link>
            </Button>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            <HomeArchiveCards products={homeProducts} />
          </div>
        </div>
      </section>

      <section className="atelier-shell py-20 text-center sm:py-28">
        <p className="editorial-kicker text-primary">Our Promise</p>
        <h2 className="mx-auto mt-5 max-w-3xl text-5xl leading-tight font-black sm:text-7xl">
          Premium Ankara, <span>responsibly sourced.</span>
        </h2>
        <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          We owe all our clients the responsibility of authenticity. Each print
          is carefully selected from trusted manufacturers and meticulously
          inspected for precision, colour consistency, depth, and long-lasting
          quality. Our commitment ensures that every fabric you receive meets
          the highest standards of excellence and truly reflects the beauty of
          Ankara craftsmanship.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { value: "100%", label: "authentic cotton ankara print" },
            { value: "50%", label: "authentic cotton ankara print" },
            { value: "30%", label: "authentic cotton ankara print" },
            { value: "3 hours", label: "max delivery within Ado-Ekiti" },
            { value: "24 hours", label: "delivery within Ekiti state" },
            { value: "48-72 hours", label: "delivery outside ekiti state." },
          ].map((item, index) => (
            <div key={index}>
              <p className="font-serif text-3xl font-black">{item.value}</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-2">
        <article className="bg-surface-dim p-8 sm:p-16 lg:p-20">
          <h2 className="text-5xl leading-tight font-black sm:text-6xl">
            The Ankara Journal.
          </h2>
          <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Learn fabric care, and see practical styling guides for everyday and
            ceremonial Ankara looks.
          </p>
          <Button asChild variant="secondary" className="mt-10 w-fit gap-3">
            <Link href="/explore">
              EXPLORE
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </article>

        <article className="relative min-h-[380px] bg-black">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1oVhVIcYX7QgUCfJxeBB4r1gbVQrc4KCHEKZ0npYBys2AqU1U5kSgaAy-Orot62ZVIor6Kb9l6Q1M21BZiX8iFRSItUWuFJCYhkQY84OYgAJIqAv2nITteh_ko0A7MoPST53FrvcOipOaXkx-1oA9qxhYPYWoggaRqTXgcsxClE_AAmn3LVL4B_-OfpxYzCOpJJJabEdigJ6DdEmbJNcmIeMaGeZxaS9nojDETvtOgjl6vtrchXj0sUChgh3mmIEcJwpZ5EhGroHr"
            alt="Draped Ankara fabric"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </article>
      </section>
    </>
  );
}
