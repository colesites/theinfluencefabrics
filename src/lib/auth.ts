import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { Pool } from "pg";

export const auth = betterAuth({
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
    ]
});

export type Auth = typeof auth;
