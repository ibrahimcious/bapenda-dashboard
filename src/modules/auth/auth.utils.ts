import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { prisma } from "#/shared/lib/prisma";
export const auth = betterAuth({
	baseURL: process.env.APP_URL ?? "http://localhost:3000",
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		// Public self-registration is closed — only an "admin" role user can
		// create new accounts, via auth.api.createUser (see auth.api.ts).
		disableSignUp: true,
	},

	// tanstackStartCookies must be last — plugins after it can set cookies
	// that don't get forwarded to the framework's cookie store.
	plugins: [admin(), tanstackStartCookies()],
});
