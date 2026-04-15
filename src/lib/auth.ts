import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { Pool } from "pg";

const isProduction = process.env.NODE_ENV === "production";
const authSecret = process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET;
const explicitAppURL =
  process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
const authBaseURL =
  explicitAppURL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

if (isProduction && !authSecret) {
  throw new Error(
    "Missing BETTER_AUTH_SECRET in production. Set BETTER_AUTH_SECRET to enable account sign in/sign up."
  );
}

if (isProduction && !explicitAppURL) {
  throw new Error(
    "Missing BETTER_AUTH_URL (or NEXT_PUBLIC_APP_URL) in production. Set it to your public domain, e.g. https://www.theinfluencefabrics.com."
  );
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

function toOrigin(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function getDomainVariants(origin: string) {
  const variants = new Set<string>([origin]);

  try {
    const url = new URL(origin);
    const host = url.hostname;

    if (host.startsWith("www.")) {
      variants.add(`${url.protocol}//${host.replace(/^www\./, "")}`);
    } else if (!host.includes("localhost") && !host.includes("127.0.0.1")) {
      variants.add(`${url.protocol}//www.${host}`);
    }
  } catch {
    // ignore malformed origins
  }

  return [...variants];
}

const trustedOriginsFromEnv = (process.env.BETTER_AUTH_TRUSTED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map(toOrigin)
  .filter((origin): origin is string => Boolean(origin));

const baseOrigin = authBaseURL ? toOrigin(authBaseURL) : null;
const trustedOrigins = [
  ...(baseOrigin ? getDomainVariants(baseOrigin) : []),
  ...trustedOriginsFromEnv,
];

export const auth = betterAuth({
    secret: authSecret,
    baseURL: authBaseURL,
    trustedOrigins,
    database: new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        async sendResetPassword({ user, url }) {
            console.log(`[AUTH] Reset password for ${user.email}: ${url}`);
        }
    },
    plugins: [
        admin()
    ],
    socialProviders: googleClientId && googleClientSecret ? {
        google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret
        }
    } : undefined
});

export type Auth = typeof auth;
