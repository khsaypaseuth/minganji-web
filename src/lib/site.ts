/**
 * Verified public facts used across the site. Keep this file in sync with
 * HANDOFF.md → "Verified facts". Do not add unverified details here.
 */
export const site = {
  name: "MingAnji.ai",
  attribution: "Powered by Tian'An",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://minganji.ai",
  signInUrl: "https://demo.minganji.ai/signin",
  // Source: footer of https://minganji.ai (reviewed 31 Oct 2026)
  email: "info@minganji.ai",
  // Source: https://minganji.ai lists "Shenzhen, China"; no street address published.
  locationKey: "shenzhen",
} as const;

export const nav = [
  { href: "/", key: "home" },
  { href: "/features", key: "features" },
  { href: "/pricing", key: "pricing" },
  { href: "/contact", key: "contact" },
] as const;
