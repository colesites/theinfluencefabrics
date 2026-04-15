'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signIn, signUp } from "@/lib/auth-client";
import { getFriendlyAuthError, getPasswordStrength } from "@/lib/auth-feedback";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/account";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [strengthLabel, setStrengthLabel] = useState("");
  const [strengthColorClass, setStrengthColorClass] = useState("text-muted-foreground");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const strength = getPasswordStrength(password);
      setStrengthLabel(strength.label);
      setStrengthColorClass(strength.colorClass);
    }, 350);

    return () => clearTimeout(timer);
  }, [password]);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signUpError } = await signUp.email({
      email,
      password,
      name,
    });

    setLoading(false);

    if (signUpError) {
      setError(getFriendlyAuthError(signUpError, "Unable to create your account."));
      return;
    }

    router.push(redirectTo);
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError("");

    const result = await signIn.social({
      provider: "google",
      callbackURL: redirectTo,
    });

    if (result?.error) {
      setError(
        getFriendlyAuthError(result.error, "Google sign up is unavailable right now.")
      );
      setGoogleLoading(false);
    }
  };

  return (
    <section className="atelier-shell py-14 sm:py-20">
      <header className="mb-12 max-w-3xl">
        <p className="editorial-kicker text-primary">Account</p>
        <h1 className="mt-4 text-5xl font-black sm:text-7xl">Create account</h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Set up your Ankara profile in a few steps.
        </p>
      </header>

      <Card className="mx-auto max-w-2xl bg-surface-container-high">
        <CardContent className="space-y-7 p-8 sm:p-12">
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            disabled={googleLoading}
            onClick={handleGoogleSignUp}
          >
            <FcGoogle className="size-4" />
            {googleLoading ? "Connecting Google..." : "Continue with Google"}
          </Button>

          <div className="text-center text-xs text-muted-foreground">or sign up with email</div>

          <form className="space-y-6" onSubmit={handleEmailSignUp}>
            <div>
              <label htmlFor="signup-name" className="editorial-kicker block text-black/70">
                Full name
              </label>
              <Input
                id="signup-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Amara Okonkwo"
                className="mt-2 normal-case tracking-normal"
                autoComplete="name"
                required
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="editorial-kicker block text-black/70">
                Email
              </label>
              <Input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className="mt-2 normal-case tracking-normal"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="editorial-kicker block text-black/70"
              >
                Password
              </label>
              <div className="relative mt-2">
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                  className="pr-10 normal-case tracking-normal"
                  autoComplete="new-password"
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
              <p className={`mt-2 text-xs ${strengthColorClass}`}>{strengthLabel || " "}</p>
            </div>

            {error ? (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <Button variant="secondary" className="w-full" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground">
            By creating an account you agree to our Ankara sales terms.
          </p>

          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/account/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
