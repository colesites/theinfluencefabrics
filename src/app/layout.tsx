import type { Metadata } from "next";
import { Inter, Noto_Serif, Poppins } from "next/font/google";

import { cn } from "@/lib/utils";
import { Providers } from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartSheet } from "@/components/cart/CartSheet";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Influencefabrics | Modern Heritage Ankara",
  description:
    "Influencefabrics brings modern heritage Ankara textiles and tailored essentials with an editorial luxury aesthetic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full scroll-smooth antialiased", inter.variable, notoSerif.variable, poppins.variable)}
    >
      <body className="min-h-full bg-background text-foreground">
        <Providers>
          <Header />
          <div className="flex min-h-screen flex-col pt-28 lg:pt-20">
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <CartSheet />
        </Providers>
      </body>
    </html>
  );
}
