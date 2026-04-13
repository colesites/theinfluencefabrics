import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ContactPage() {
  return (
    <section className="atelier-shell py-14 sm:py-20">
      <div className="mb-12 max-w-3xl">
        <p className="editorial-kicker text-primary">Contact Us</p>
        <h1 className="mt-4 text-5xl leading-tight font-black sm:text-7xl">
          Start an Ankara conversation.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Reach our team for custom sourcing, ankara dropshipping, bulk order,
          aso ebi sourcing, sewing of ankara fabrics, or collaboration.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="bg-surface-container-low">
          <CardContent className="space-y-8 p-8 sm:p-12">
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="first-name"
                  className="editorial-kicker block text-black/70"
                >
                  First Name
                </label>
                <Input id="first-name" placeholder="Amara" className="mt-2" />
              </div>
              <div>
                <label
                  htmlFor="last-name"
                  className="editorial-kicker block text-black/70"
                >
                  Last Name
                </label>
                <Input id="last-name" placeholder="Okonkwo" className="mt-2" />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="editorial-kicker block text-black/70"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="hello@influencefabrics.com"
                className="mt-2"
              />
            </div>

            <div>
              <label
                htmlFor="subject"
                className="editorial-kicker block text-black/70"
              >
                Subject
              </label>
              <Input
                id="subject"
                placeholder="Ankara bundle request"
                className="mt-2"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="editorial-kicker block text-black/70"
              >
                Message
              </label>
              <textarea
                id="message"
                rows={6}
                className="mt-2 w-full border-x-0 border-t-0 border-b-2 border-black bg-transparent px-0 py-2 text-sm leading-relaxed uppercase tracking-[0.12em] outline-none focus:border-primary"
                placeholder="Tell us what you need..."
              />
            </div>

            <Button size="lg" className="w-full sm:w-fit">
              Send Inquiry
            </Button>
          </CardContent>
        </Card>

        <article className="relative min-h-[360px] overflow-hidden bg-surface-container-highest">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD71hSJcqW-WLbhrEFsCZJoP5H9uRUwTDO1PMwxE3gd-JeVuf_U7pfi6erq3XTPU0Jd5qa85ZKY98glbiOOOiUSTvIJkWFxODYWSyW-emEwuGs0m6AA9TeGUR9s2m1tYbebmwEBz3haVjeKWqUqpvEfRZKZVbneqBNJLSrPvoLsKf28jglrTf--dlm159-aB2RF_VDBXyP28wQbF_x3XokwDlv-hXaTWFVXRWw9Sd54VJfElmsOplsLtspGonBDKAUkcZWExGUDj--f"
            alt="Ankara textile bolts"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 30vw"
          />
          <div className="absolute inset-x-0 bottom-0 bg-black/65 p-8 text-white">
            <p className="editorial-kicker text-white/75">Ado-Ekiti studio</p>
            <p className="mt-3 max-w-xs text-sm uppercase tracking-[0.14em]">
              Physical store open Monday to Saturday, 9am to 6pm. Virtual
              consultations available globally.
            </p>
          </div>
        </article>
      </div>

      <Card className="mt-8 bg-surface-container-high">
        <CardContent className="flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <p className="editorial-kicker text-primary">Community</p>
            <h2 className="mt-3 text-3xl font-black">
              Join My WhatsApp Community
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Get first access to new Ankara arrivals, restock alerts, and
              styling drops from Influencefabrics.
            </p>
          </div>

          <Button
            asChild
            variant="whatsapp"
            size="lg"
            className="w-full gap-3 sm:w-auto"
          >
            <a
              href="https://chat.whatsapp.com/KMIW3D9veow29Ltt28isJS?mode=gi_t"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp className="size-4" />
              Join WhatsApp
            </a>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
