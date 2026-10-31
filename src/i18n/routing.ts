import { defineRouting } from "next-intl/routing";

export const locales = ["en", "zh", "lo", "th", "vi"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  // Every page URL carries its locale (/en, /zh/features …) so the selected
  // language is preserved while navigating and is shareable.
  localePrefix: "always",
});

/** Display metadata for the language selector. Names are shown in their own script. */
export const localeMeta: Record<Locale, { name: string; english: string; flag: "gb" | "cn" | "la" | "th" | "vn"; htmlLang: string }> = {
  en: { name: "English", english: "English", flag: "gb", htmlLang: "en" },
  zh: { name: "简体中文", english: "Chinese (Simplified)", flag: "cn", htmlLang: "zh-Hans" },
  lo: { name: "ລາວ", english: "Lao", flag: "la", htmlLang: "lo" },
  th: { name: "ไทย", english: "Thai", flag: "th", htmlLang: "th" },
  vi: { name: "Tiếng Việt", english: "Vietnamese", flag: "vn", htmlLang: "vi" },
};
