'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { signOut, useSession } from "@/lib/auth-client";
import { getUserOrders, type OrderRecord } from "@/lib/orders";
import { Clock, Package } from "lucide-react";

function getGreetingName(name: string | null | undefined, email: string) {
  const toTitleCase = (value: string) =>
    value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
  const normalizedName = (name || "").trim().replace(/\s+/g, " ");
  const firstToken = normalizedName.split(" ")[0] || "";

  if (firstToken.length >= 2) return firstToken;

  const emailLocalPart = email.split("@")[0] || "";
  const fallback = emailLocalPart
    .split(/[._-]+/)
    .filter(Boolean)[0];

  return toTitleCase(fallback) || "there";
}

function SignedInState({ email, name }: { email: string; name?: string | null }) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const greetingName = getGreetingName(name, email);

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      setLoadingOrders(true);
      const data = await getUserOrders(email);
      if (!mounted) return;
      setOrders(data);
      setLoadingOrders(false);
    };

    void loadOrders();

    return () => {
      mounted = false;
    };
  }, [email]);

  return (
    <section className="atelier-shell py-14 sm:py-20">
      <header className="mb-14 border-b border-black/10 pb-12">
        <p className="editorial-kicker text-primary">Archive Profile</p>
        <h1 className="mt-4 text-5xl font-black italic font-serif">
          Welcome back, {greetingName}.
        </h1>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <div className="text-xs normal-case tracking-widest text-muted-foreground">
            {email}
          </div>
          <button
            onClick={() => signOut()}
            className="text-[10px] font-black uppercase tracking-[0.2em] underline underline-offset-4 hover:text-primary transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="space-y-12">
        <div>
          <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
            <Package className="size-6" />
            Your Order History
          </h2>

          {loadingOrders ? (
            <p className="text-sm italic text-muted-foreground">
              Fetching your textile archives...
            </p>
          ) : orders.length === 0 ? (
            <div className="p-12 bg-surface-container-low border border-dashed border-black/10 text-center">
              <p className="font-serif italic text-lg text-muted-foreground">
                No orders found in your archive yet.
              </p>
              <Link
                href="/collection"
                className="mt-4 inline-block text-xs uppercase tracking-widest text-primary font-bold hover:underline"
              >
                Start your collection
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => (
                <Card
                  key={order._id}
                  className="bg-surface-container-low border-none shadow-sm overflow-hidden"
                >
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-[1fr_200px_150px] items-center">
                      <div className="p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] uppercase font-black tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded">
                            Order #{order.orderNumber}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                            {new Date(order._createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4">
                          {order.items.map((item) => (
                            <span key={item._key} className="text-xs text-black/70">
                              {item.name}{" "}
                              <span className="text-[10px] opacity-50">
                                ({item.quantity}y)
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-black/5 h-full p-6 sm:p-8 flex flex-col justify-center">
                        <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">
                          Status
                        </p>
                        <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                          <Clock className="size-3" />
                          {order.status}
                        </p>
                      </div>
                      <div className="p-6 sm:p-8 text-right">
                        <p className="text-2xl font-black font-serif italic">
                          ₦{order.totalPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/account/sign-in?redirectTo=/account");
    }
  }, [isPending, router, session?.user]);

  if (isPending) return <div className="py-24 text-center">Loading profile...</div>;

  if (!session?.user) {
    return <div className="py-24 text-center">Redirecting to sign in...</div>;
  }

  return (
    <SignedInState email={session.user.email} name={session.user.name} />
  );
}
