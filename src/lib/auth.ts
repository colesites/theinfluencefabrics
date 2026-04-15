import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { Pool } from "pg";

const isProduction = process.env.NODE_ENV === "production";
const authSecret = process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET;
const authBaseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

if (isProduction && !authSecret) {
  throw new Error(
    "Missing BETTER_AUTH_SECRET in production. Set BETTER_AUTH_SECRET to enable account sign in/sign up."
  );
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
    secret: authSecret,
    baseURL: authBaseURL,
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
