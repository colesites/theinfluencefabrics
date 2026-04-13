import Link from "next/link";
import { ArrowRight, Globe, Mail } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="mt-24 bg-surface-container px-4 py-16 sm:px-8">
      <div className="atelier-shell">
        <div className="grid gap-12 border-b border-black/10 pb-12 md:grid-cols-3">
          <div>
            <p className="font-serif text-lg font-black uppercase tracking-tight">
              Influence fabrics
            </p>
            <p className="mt-4 max-w-sm text-xs leading-relaxed uppercase tracking-[0.14em] text-black/65">
              Defining the geometry of tradition through modern artisanal Ankara
              craftsmanship.
            </p>
          </div>

          <div>
            <p className="editorial-kicker text-black/70">Client Service</p>
            <div className="mt-5 flex flex-col gap-3 text-xs uppercase tracking-[0.14em]">
              <Link href="/our-story" className="hover:text-primary">
                Our Story
              </Link>
              <Link href="/contact" className="hover:text-primary">
                Contact
              </Link>
              <Link href="/collection" className="hover:text-primary">
                Collection
              </Link>
              <Link href="/account" className="hover:text-primary">
                Account
              </Link>
            </div>
          </div>

          <form className="space-y-4" action="#" method="post">
            <p className="editorial-kicker text-black/70">Newsletter</p>
            <label htmlFor="newsletter" className="sr-only">
              Enter email
            </label>
            <div className="flex items-end gap-4">
              <Input
                id="newsletter"
                type="email"
                placeholder="Enter email"
                className="text-xs"
              />
              <Button
                size="icon-sm"
                className="shrink-0"
                aria-label="Submit email"
              >
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-[10px] uppercase tracking-[0.16em] text-black/45">
            © 2026 influence fabrics atelier. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-black/70">
            <Globe className="size-4" />
            <Mail className="size-4" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
