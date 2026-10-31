import { Archivo, Noto_Sans, Noto_Sans_SC, Noto_Sans_Lao, Noto_Sans_Thai, JetBrains_Mono } from "next/font/google";

// Display: Archivo (Latin + Vietnamese). Body: Noto Sans. Script fallbacks load
// only when glyphs from their unicode-range are used on the page.
export const heading = Archivo({ subsets: ["latin", "vietnamese"], weight: ["500", "600", "700", "800"], variable: "--font-heading", display: "swap" });
export const body = Noto_Sans({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });
export const sc = Noto_Sans_SC({ weight: ["400", "500", "700"], variable: "--font-sc", display: "swap", preload: false });
export const lao = Noto_Sans_Lao({ subsets: ["lao"], weight: ["400", "500", "600", "700"], variable: "--font-lao", display: "swap", preload: false });
export const thai = Noto_Sans_Thai({ subsets: ["thai"], weight: ["400", "500", "600", "700"], variable: "--font-thai", display: "swap", preload: false });
export const mono = JetBrains_Mono({ subsets: ["latin", "vietnamese"], weight: ["400", "500"], variable: "--font-code", display: "swap" });

export const fontVariables = [heading, body, sc, lao, thai, mono].map((f) => f.variable).join(" ");
