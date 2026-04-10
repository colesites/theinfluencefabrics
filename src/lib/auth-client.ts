import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    plugins: [
        adminClient()
    ]
});

// Primary exports for standard flows
export const { signIn, signUp, signOut, useSession } = authClient;
