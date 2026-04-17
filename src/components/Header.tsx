"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FaRegUser } from "react-icons/fa6";
import { Search, X, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const primaryLinks = [
  { name: "Home", href: "/" },
  { name: "Collection", href: "/collection" },
  { name: "Our Story", href: "/our-story" },
  { name: "Contact Us", href: "/contact" },
];

const utilityLinks = [
  { name: "Cart", href: "/cart", icon: ShoppingCart },
  { name: "Account", href: "/account/sign-in", icon: FaRegUser },
];

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/collection?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        isScrolled
          ? "bg-[#e7e7e7]/95 backdrop-blur-xl"
          : "bg-[#e7e7e7]/80 backdrop-blur-xl",
      )}
    >
      <nav className="atelier-shell flex h-20 items-center justify-between gap-4">
        <Link href="/" className="shrink-0" aria-label="Influence fabrics home">
          <Image
            src="/influencefabrics-orange.png"
            alt="Influence fabrics"
            width={214}
            height={75}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <ul className="hidden items-center gap-8 font-serif text-[11px] uppercase tracking-[0.18em] lg:flex">
          {primaryLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className={cn(
                  "pb-1 transition-colors hover:text-primary",
                  isActiveRoute(link.href)
                    ? "text-primary underline decoration-2 underline-offset-8"
                    : "text-foreground",
                )}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <div className="relative flex items-center">
            {isSearchOpen && (
              <form
                onSubmit={handleSearch}
                className="absolute right-full mr-4 flex animate-in fade-in slide-in-from-right-4 duration-300"
              >
                <input
                  type="text"
                  autoFocus
                  placeholder="Search archive..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 bg-transparent border-b border-black/20 pb-1 text-xs focus:border-primary focus:outline-none placeholder:text-black/30 placeholder:italic"
                />
              </form>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={cn("border-none", isSearchOpen && "text-primary")}
            >
              {isSearchOpen ? (
                <X className="size-5" />
              ) : (
                <Search className="size-5" />
              )}
            </Button>
          </div>

          {utilityLinks.map((link) => {
            const Icon = link.icon;

            return (
              <Button
                key={link.name}
                asChild
                variant="ghost"
                size="icon-sm"
                className={cn(
                  "border-none",
                  isActiveRoute(link.href) && "text-primary",
                )}
              >
                <Link href={link.href} aria-label={link.name}>
                  <Icon className="size-5" />
                </Link>
              </Button>
            );
          })}
        </div>
      </nav>

      <div className="atelier-shell border-t border-black/10 pb-3 lg:hidden overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex w-full items-center justify-between gap-5 pt-3 font-serif text-[9px] min-[375px]:text-[10px] uppercase tracking-widest min-[375px]:tracking-[0.18em] min-w-max px-1">
          {primaryLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className={cn(
                  "transition-colors hover:text-primary",
                  isActiveRoute(link.href)
                    ? "text-primary underline decoration-2 underline-offset-6"
                    : "text-foreground",
                )}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
};

export default Header;
