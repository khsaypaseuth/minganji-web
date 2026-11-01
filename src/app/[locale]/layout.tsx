import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, localeMeta, type Locale } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { site } from "@/lib/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { ScrollReveal, REVEAL_TARGETS } from "@/components/layout/ScrollReveal";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeScript } from "@/components/theme/ThemeScript";
import { THEME_COLOR } from "@/components/theme/theme";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  // Light by default; ThemeProvider updates it to the visitor's chosen theme.
  themeColor: THEME_COLOR.light,
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(site.url),
    title: { default: t("siteTitle"), template: `%s · ${site.name}` },
    description: t("siteDescription"),
    applicationName: site.name,
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(routing.locales.map((l) => [localeMeta[l].htmlLang, `/${l}`])),
    },
    openGraph: { type: "website", siteName: site.name, title: t("siteTitle"), description: t("siteDescription"), locale },
    twitter: { card: "summary_large_image", title: t("siteTitle"), description: t("siteDescription") },
    icons: { icon: "/icon.svg" },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <html lang={localeMeta[locale as Locale].htmlLang} className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Sets data-theme on <html> before first paint (no flash of the wrong theme). */}
        <ThemeScript />
        {/* Without JavaScript, never hide reveal targets. */}
        <noscript>
          <style>{`${REVEAL_TARGETS} { opacity: 1 !important; animation: none !important; }`}</style>
        </noscript>
      </head>
      <body className="min-h-screen bg-paper">
        <ThemeProvider>
          <NextIntlClientProvider>
            <Header />
            <main id="main" tabIndex={-1} className="outline-none">
              {children}
            </main>
            <Footer />
            <ChatWidget />
            <ScrollReveal />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
