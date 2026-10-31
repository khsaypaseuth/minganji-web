import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("pricingTitle"), description: t("pricingDescription"), alternates: { canonical: `/${locale}/pricing` } };
}

// No prices, packages or limits are published: none were verified. See HANDOFF.md.
export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pricing");
  const c = await getTranslations("common");
  const steps = ["one", "two", "three"] as const;

  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-14 sm:pb-24 sm:pt-20">
        <div className="pointer-events-none absolute inset-0 grid-paper [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" aria-hidden="true" />
        <Container className="relative">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
            <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
            <div className="relative rounded-[26px] bg-white p-7 shadow-[var(--shadow-lg)] ring-1 ring-line sm:p-9">
              <span className="absolute right-6 top-6 h-2.5 w-2.5 rounded-full bg-signal" aria-hidden="true" />
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-steel">MingAnji.ai</p>
              <h2 className="font-display mt-3 text-[28px] font-semibold leading-tight text-ink">{t("cardTitle")}</h2>
              <p className="mt-3 text-[15.5px] leading-relaxed text-slate">{t("cardBody")}</p>
              <ul className="mt-6 space-y-2.5 border-t border-line pt-6">
                {(t.raw("ask") as string[]).map((a) => (
                  <li key={a} className="flex gap-3 text-[14.5px] text-graphite">
                    <Icon name="check" size={18} className="mt-0.5 shrink-0 text-signal" />
                    {a}
                  </li>
                ))}
              </ul>
              <ButtonLink href={{ pathname: "/contact", query: { topic: "pricing" } }} size="lg" arrow className="mt-8 w-full">
                {t("cardCta")}
              </ButtonLink>
              <p className="mt-4 text-center text-[13px] text-slate">
                <a href={`mailto:${site.email}`} className="underline decoration-line-strong underline-offset-4 hover:text-signal">{site.email}</a>
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="steps-title" className="bg-mist py-16 sm:py-24">
        <Container>
          <h2 id="steps-title" className="font-display text-[clamp(1.6rem,3vw,2.3rem)] font-semibold text-ink">{t("stepsTitle")}</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s} className="rounded-[20px] bg-white p-6 ring-1 ring-line">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink font-mono text-[13px] text-white">{i + 1}</span>
                <h3 className="mt-5 text-[17px] font-semibold text-ink">{t(`steps.${s}.title`)}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-slate">{t(`steps.${s}.body`)}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section aria-labelledby="faq-title" className="py-16 sm:py-24">
        <Container className="max-w-[860px]">
          <h2 id="faq-title" className="font-display text-[clamp(1.6rem,3vw,2.3rem)] font-semibold text-ink">{t("faqTitle")}</h2>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {[1, 2, 3].map((n) => (
              <details key={n} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {t(`faq.q${n}`)}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ring-line transition-transform group-open:rotate-45">
                    <Icon name="plus" size={16} />
                  </span>
                </summary>
                <p className="mt-3 max-w-[65ch] text-[15.5px] leading-relaxed text-slate">{t(`faq.a${n}`)}</p>
              </details>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href={{ pathname: "/contact", query: { topic: "pricing" } }} arrow>{t("cardCta")}</ButtonLink>
            <ButtonLink href="/features" variant="secondary">{c("exploreFeatures")}</ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
