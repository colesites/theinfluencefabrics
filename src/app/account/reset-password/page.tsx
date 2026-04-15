'use client';
import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <Card className="bg-surface-container-low border-none shadow-sm text-center p-12">
        <p className="text-destructive font-bold uppercase tracking-widest text-xs">Invalid or Missing Token</p>
        <p className="mt-4 text-sm text-muted-foreground">This reset link may have expired or is malformed.</p>
        <Button asChild variant="outline" className="mt-8 w-full">
          <Link href="/account/forgot-password">Request New Link</Link>
        </Button>
      </Card>
    );
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token: token,
      });
      
      if (error) {
        setError(error.message || "Failed to reset password.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="bg-surface-container-low border-none shadow-sm text-center p-12 space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="size-16 bg-success/10 rounded-full flex items-center justify-center mx-auto text-green-600">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="text-2xl font-black">Archive Restored.</h2>
        <p className="text-sm text-muted-foreground">Your password has been successfully updated. You can now sign in with your new credentials.</p>
        <Button asChild className="w-full h-12">
          <Link href="/account/sign-in">Sign in</Link>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="bg-surface-container-low border-none shadow-sm">
      <CardContent className="p-8 sm:p-12 space-y-7">
        <form onSubmit={handleReset} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="pass" className="editorial-kicker block text-black/70">New Password</label>
              <Input 
                id="pass" 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="mt-2 h-12" 
              />
            </div>
            <div>
              <label htmlFor="confirm" className="editorial-kicker block text-black/70">Confirm New Password</label>
              <Input 
                id="confirm" 
                type="password" 
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••" 
                className="mt-2 h-12" 
              />
            </div>
          </div>

          {error && (
          <p className="text-sm font-semibold text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full h-12" disabled={loading}>
            {loading ? "Updating..." : "Confirm New Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <section className="atelier-shell py-14 sm:py-24 max-w-xl mx-auto">
      <header className="mb-12">
        <p className="editorial-kicker text-primary">Security</p>
        <h1 className="mt-4 text-5xl font-black italic font-serif">Update Credentials.</h1>
        <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
          Create a new, secure password for your Ankara account.
        </p>
      </header>

      <Suspense fallback={<div className="text-center py-10">Authenticating token...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </section>
  );
}
