'use client';
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Direct fetch to Better Auth API to bypass client-side type-inference issues
      const res = await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          redirectTo: "/account/reset-password",
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || "Something went wrong. Please try again.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="atelier-shell py-14 sm:py-24 max-w-xl mx-auto">
      <Link href="/account/sign-in" className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-12">
        <ChevronLeft className="size-3" />
        Back to Sign In
      </Link>

      <header className="mb-12">
        <p className="editorial-kicker text-primary">Security</p>
        <h1 className="mt-4 text-5xl font-black italic font-serif">Restore Archive Access.</h1>
        <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
          Enter your email address and we&apos;ll send you a secure link to reset your password.
        </p>
      </header>

      {success ? (
        <Card className="bg-surface-container-low border-none shadow-sm">
          <CardContent className="p-8 sm:p-12 text-center space-y-6">
            <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Mail className="size-8 text-primary" />
            </div>
            <h2 className="text-2xl font-black">Email Dispatched</h2>
            <p className="text-sm text-muted-foreground">
              If an account exists for <span className="text-black font-semibold">{email}</span>, 
              you will receive a reset link shortly. Please check your system logs (or console) for the development link.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/account/sign-in">Return to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-surface-container-low border-none shadow-sm">
          <CardContent className="p-8 sm:p-12 space-y-7">
            <form onSubmit={handleResetRequest} className="space-y-6">
              <div>
                <label htmlFor="email" className="editorial-kicker block text-black/70">
                  Account Email
                </label>
                <Input 
                  id="email" 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@email.com" 
                  className="mt-2 h-12 normal-case tracking-normal" 
                />
              </div>

              {error && (
                <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{error}</p>
              )}

              <Button type="submit" className="w-full h-12" disabled={loading}>
                {loading ? "Requesting..." : "Send Reset Link"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
