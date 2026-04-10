'use client';
import { useState, use } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signIn, signUp, useSession, signOut } from "@/lib/auth-client";
import { getUserOrders, type OrderRecord } from "@/lib/orders";
import { Package, Clock, ExternalLink } from "lucide-react";

export default function AccountPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  
  const [emailIn, setEmailIn] = useState('');
  const [passwordIn, setPasswordIn] = useState('');
  const [loadingIn, setLoadingIn] = useState(false);
  
  const [nameUp, setNameUp] = useState('');
  const [emailUp, setEmailUp] = useState('');
  const [passwordUp, setPasswordUp] = useState('');
  const [loadingUp, setLoadingUp] = useState(false);

  const handleAuthSuccess = () => {
    if (redirectTo) {
      router.push(redirectTo);
    }
  }

  const handleSignIn = async () => {
    setLoadingIn(true);
    const { error } = await signIn.email({ email: emailIn, password: passwordIn });
    setLoadingIn(false);
    if (!error) handleAuthSuccess();
  }

  const handleSignUp = async () => {
    setLoadingUp(true);
    const { error } = await signUp.email({ email: emailUp, password: passwordUp, name: nameUp });
    setLoadingUp(false);
    if (!error) handleAuthSuccess();
  }

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useState(() => {
    if (session?.user?.email) {
      setLoadingOrders(true);
      getUserOrders(session.user.email).then(data => {
        setOrders(data);
        setLoadingOrders(false);
      });
    }
  });

  if (isPending) return <div className="py-24 text-center">Loading Archive...</div>;

  if (session?.user) {
    return (
      <section className="atelier-shell py-14 sm:py-20">
        <header className="mb-14 border-b border-black/10 pb-12">
          <p className="editorial-kicker text-primary">Archive Profile</p>
          <h1 className="mt-4 text-5xl font-black italic font-serif">Welcome back, {session.user.name.split(' ')[0]}.</h1>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              {session.user.email}
            </div>
            <button onClick={() => signOut()} className="text-[10px] font-black uppercase tracking-[0.2em] underline underline-offset-4 hover:text-primary transition-colors">
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
              <p className="text-sm italic text-muted-foreground">Fetching your textile archives...</p>
            ) : orders.length === 0 ? (
              <div className="p-12 bg-surface-container-low border border-dashed border-black/10 text-center">
                <p className="font-serif italic text-lg text-muted-foreground">No orders found in your archive yet.</p>
                <Link href="/collection" className="mt-4 inline-block text-xs uppercase tracking-widest text-primary font-bold hover:underline">Start your collection</Link>
              </div>
            ) : (
              <div className="grid gap-6">
                {orders.map(order => (
                  <Card key={order._id} className="bg-surface-container-low border-none shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                      <div className="grid md:grid-cols-[1fr_200px_150px] items-center">
                        <div className="p-6 sm:p-8">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-[10px] uppercase font-black tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded">
                              Order #{order.orderNumber}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                              {new Date(order._createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4">
                            {order.items.map(item => (
                              <span key={item._key} className="text-xs text-black/70">
                                {item.name} <span className="text-[10px] opacity-50">({item.quantity}y)</span>
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="bg-black/5 h-full p-6 sm:p-8 flex flex-col justify-center">
                          <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                          <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <Clock className="size-3" />
                            {order.status}
                          </p>
                        </div>
                        <div className="p-6 sm:p-8 text-right">
                          <p className="text-2xl font-black font-serif italic">₦{order.totalPrice.toLocaleString()}</p>
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
    )
  }

  return (
    <section className="atelier-shell py-14 sm:py-20">
      <header className="mb-12 max-w-3xl">
        <p className="editorial-kicker text-primary">Account</p>
        <h1 className="mt-4 text-5xl font-black sm:text-7xl">Welcome to your Ankara profile.</h1>
        {redirectTo && (
          <div className="mt-6 p-4 bg-primary/5 border border-primary/10 flex items-center gap-3">
             <div className="size-2 bg-primary rounded-full animate-pulse" />
             <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-primary">Please identify yourself to complete your order</p>
          </div>
        )}
        {!redirectTo && (
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Manage Ankara orders, saved palettes, and custom-cut requests from one dashboard.
          </p>
        )}
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="bg-surface-container-low">
          <CardContent className="space-y-7 p-8 sm:p-12">
            <h2 className="text-3xl font-black">Sign In</h2>

            <div>
              <label htmlFor="signin-email" className="editorial-kicker block text-black/70">
                Email
              </label>
              <Input 
                id="signin-email" 
                type="email" 
                value={emailIn}
                onChange={e => setEmailIn(e.target.value)}
                placeholder="name@email.com" 
                className="mt-2" 
               />
            </div>

            <div>
              <label htmlFor="signin-password" className="editorial-kicker block text-black/70">
                Password
              </label>
              <Input 
                id="signin-password" 
                type="password" 
                value={passwordIn}
                onChange={e => setPasswordIn(e.target.value)}
                placeholder="••••••••" 
                className="mt-2" 
              />
            </div>

            <Button className="w-full" onClick={handleSignIn} disabled={loadingIn}>
              {loadingIn ? 'Signing In...' : 'Sign In'}
            </Button>
            <Button variant="tertiary" className="w-fit" asChild>
              <Link href="/account/forgot-password">Forgot password</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-surface-container-high">
          <CardContent className="space-y-7 p-8 sm:p-12">
            <h2 className="text-3xl font-black">Create Account</h2>

            <div>
              <label htmlFor="signup-name" className="editorial-kicker block text-black/70">
                Full Name
              </label>
              <Input id="signup-name" value={nameUp} onChange={e => setNameUp(e.target.value)} placeholder="Amara Okonkwo" className="mt-2" />
            </div>

            <div>
              <label htmlFor="signup-email" className="editorial-kicker block text-black/70">
                Email
              </label>
              <Input id="signup-email" type="email" value={emailUp} onChange={e => setEmailUp(e.target.value)} placeholder="name@email.com" className="mt-2" />
            </div>

            <div>
              <label htmlFor="signup-password" className="editorial-kicker block text-black/70">
                Password
              </label>
              <Input id="signup-password" type="password" value={passwordUp} onChange={e => setPasswordUp(e.target.value)} placeholder="Create password" className="mt-2" />
            </div>

            <Button variant="secondary" className="w-full" onClick={handleSignUp} disabled={loadingUp}>
              {loadingUp ? 'Creating Profile...' : 'Create Ankara Profile'}
            </Button>
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              By creating an account you agree to our Ankara sales terms.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 flex flex-wrap gap-4 text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
        <Link href="/collection" className="hover:text-primary">
          Shop Collection
        </Link>
        <span>/</span>
        <Link href="/contact" className="hover:text-primary">
          Contact Support
        </Link>
      </div>
    </section>
  );
}
