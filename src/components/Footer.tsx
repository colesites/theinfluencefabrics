"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe, Mail } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleNewsletterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", text: payload.error || "Unable to subscribe right now." });
        return;
      }

      setFeedback({ type: "success", text: "Subscribed successfully." });
      setEmail("");
    } catch {
      setFeedback({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="mt-24 bg-surface-container px-4 py-16 sm:px-8">
      <div className="atelier-shell">
        <div className="grid gap-12 border-b border-black/10 pb-12 md:grid-cols-3">
          <div>
            <p className="font-serif text-lg font-black uppercase tracking-tight">
              Influence fabrics
            </p>
            <p className="mt-4 max-w-sm text-xs leading-relaxed uppercase tracking-[0.14em] text-black/65">
              Bringing to your doorstep a blend of african culture and modern
              beauty in exquisite ankara prints.
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

          <form className="space-y-4" onSubmit={handleNewsletterSubmit}>
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
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <Button
                size="icon-sm"
                className="shrink-0"
                aria-label="Submit email"
                disabled={submitting}
              >
                <ArrowRight className="size-4" />
              </Button>
            </div>
            {feedback ? (
              <p
                className={
                  feedback.type === "success"
                    ? "text-[10px] font-semibold uppercase tracking-[0.12em] text-primary"
                    : "text-[10px] font-semibold uppercase tracking-[0.12em] text-destructive"
                }
              >
                {feedback.text}
              </p>
            ) : null}
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
