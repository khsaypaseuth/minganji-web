import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Story } from "@/components/story/Story";
import { Benefits, ClosingCta, TruckCategories } from "@/components/home/HomeSections";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: { absolute: `${t("homeTitle")} · MingAnji.ai` }, description: t("siteDescription"), alternates: { canonical: `/${locale}` } };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Story />
      <TruckCategories />
      <Benefits />
      <ClosingCta />
    </>
  );
}
