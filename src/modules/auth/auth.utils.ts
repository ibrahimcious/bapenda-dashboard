import { prisma } from "#/shared/lib/prisma"
import { prismaAdapter } from "@better-auth/prisma-adapter"
import { betterAuth } from "better-auth"
import { tanstackStartCookies } from "better-auth/tanstack-start"
export const auth = betterAuth({
  baseURL: process.env.APP_URL ?? "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  emailAndPassword: {
    enabled: true
  },

  plugins: [tanstackStartCookies()]
})
