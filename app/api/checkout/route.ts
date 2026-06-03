import { Checkout } from "@polar-sh/nextjs"

export const GET = Checkout({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    successUrl: `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/dashboard`,
    theme: "dark",
    server: process.env.POLAR_SANDBOX === "true" ? "sandbox" : "production",
})
