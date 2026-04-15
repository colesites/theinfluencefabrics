'use client';

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth-client";
import { getFriendlyAuthError } from "@/lib/auth-feedback";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await signIn.email({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(getFriendlyAuthError(signInError, "Unable to sign in right now."));
      return;
    }

    router.push(redirectTo);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");

    const result = await signIn.social({
      provider: "google",
      callbackURL: redirectTo,
    });

    if (result?.error) {
      setError(
        getFriendlyAuthError(result.error, "Google sign in is unavailable right now.")
      );
      setGoogleLoading(false);
    }
  };

  return (
    <section className="atelier-shell py-14 sm:py-20">
      <header className="mb-12 max-w-3xl">
        <p className="editorial-kicker text-primary">Account</p>
        <h1 className="mt-4 text-5xl font-black sm:text-7xl">Sign in</h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Continue to your Ankara profile.
        </p>
      </header>

      <Card className="mx-auto max-w-2xl bg-surface-container-low">
        <CardContent className="space-y-7 p-8 sm:p-12">
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            disabled={googleLoading}
            onClick={handleGoogleSignIn}
          >
            <FcGoogle className="size-4" />
            {googleLoading ? "Connecting Google..." : "Continue with Google"}
          </Button>

          <div className="text-center text-xs text-muted-foreground">or use email</div>

          <form className="space-y-6" onSubmit={handleEmailSignIn}>
            <div>
              <label htmlFor="signin-email" className="editorial-kicker block text-black/70">
                Email
              </label>
              <Input
                id="signin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className="mt-2 normal-case tracking-normal"
                required
              />
            </div>

            <div>
              <label
                htmlFor="signin-password"
                className="editorial-kicker block text-black/70"
              >
                Password
              </label>
              <div className="relative mt-2">
                <Input
                  id="signin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pr-10 normal-case tracking-normal"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <Link href="/account/forgot-password" className="hover:text-primary hover:underline">
              Forgot password?
            </Link>
            <p>
              New here?{" "}
              <Link href="/account/sign-up" className="text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center">Loading sign in...</div>}>
      <SignInForm />
    </Suspense>
  );
}
