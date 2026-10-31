import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container, SectionHeading } from "@/components/ui/Section";
import { ContactForm } from "@/components/contact/ContactForm";
import { Icon } from "@/components/icons/Icon";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("contactTitle"), description: t("contactDescription"), alternates: { canonical: `/${locale}/contact` } };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const c = await getTranslations("common");
  const f = await getTranslations("footer");
  return (
    <section className="relative overflow-hidden bg-mist pb-20 pt-14 sm:pb-28 sm:pt-20">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
            <div className="mt-10 space-y-4">
              <div className="rounded-[20px] bg-white p-6 ring-1 ring-line">
                <h2 className="text-[13px] font-medium uppercase tracking-[0.1em] text-steel">{t("directTitle")}</h2>
                <dl className="mt-4 space-y-4 text-[15px]">
                  <div className="flex items-start gap-3">
                    <Icon name="mail" size={20} className="mt-0.5 text-signal" />
                    <div><dt className="text-[13px] text-slate">{t("emailLabel")}</dt><dd><a href={`mailto:${site.email}`} className="inline-flex min-h-10 items-center font-medium text-ink hover:text-signal">{site.email}</a></dd></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="pin" size={20} className="mt-0.5 text-signal" />
                    <div><dt className="text-[13px] text-slate">{t("locationLabel")}</dt><dd className="font-medium text-ink">{f("location")}</dd></div>
                  </div>
                </dl>
              </div>
              <div className="rounded-[20px] bg-ink p-6 text-white">
                <h2 className="text-[16px] font-semibold">{t("portalTitle")}</h2>
                <p className="mt-1 text-[14px] text-white/70">{t("portalBody")}</p>
                <a href={site.signInUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-10 items-center gap-1.5 text-[14.5px] font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">
                  {c("signIn")}<Icon name="arrowUpRight" size={15} /><span className="sr-only"> {c("opensInNewTab")}</span>
                </a>
              </div>
            </div>
          </div>
          <div id="enquiry">
            <Suspense>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </Container>
    </section>
  );
}
