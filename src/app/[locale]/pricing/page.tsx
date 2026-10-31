import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { Fragment } from "react";
import { COMPARE, CURRENCY, PLANS, type Cell, type Plan } from "@/lib/plans";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("pricingTitle"), description: t("pricingDescription"), alternates: { canonical: `/${locale}/pricing` } };
}

const groupIcon = { fleet: "gauge", tracking: "map", reports: "chart", drilling: "drill" } as const;

// Plans and prices come from src/lib/plans.ts. See HANDOFF.md ("Pricing source").
export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pricing");
  const c = await getTranslations("common");
  const currency = CURRENCY[locale as keyof typeof CURRENCY] ?? "USD";
  const money = new Intl.NumberFormat(locale === "zh" ? "zh-CN" : locale, { style: "currency", currency, maximumFractionDigits: 0 });
  const faqs = [1, 2, 3, 4, 5];

  const price = (p: Plan) =>
    p.price === null ? (
      <span className="font-display text-[clamp(1.6rem,2.4vw,2.125rem)] font-semibold leading-none text-ink">{t("custom")}</span>
    ) : p.price === 0 ? (
      <span className="font-display text-[34px] font-semibold leading-none text-ink">{t("free")}</span>
    ) : (
      <span className="flex flex-wrap items-baseline gap-x-1.5">
        {/* Amount large, currency symbol small, in the order the locale writes them */}
        <span className="font-display text-[34px] font-semibold leading-none tabular-nums text-ink">
          {money.formatToParts(p.price[currency]).map((part, i) =>
            part.type === "currency" ? (
              <span key={i} className="mx-0.5 align-top text-[18px] font-semibold text-graphite">{part.value}</span>
            ) : (
              <Fragment key={i}>{part.value.trim() === "" ? "" : part.value}</Fragment>
            ),
          )}
        </span>
        <span className="text-[14px] text-slate">{t("perMonth")}</span>
      </span>
    );

  const cell = (v: Cell) =>
    v === true ? (
      <>
        <Icon name="check" size={18} className="mx-auto text-signal" />
        <span className="sr-only">{t("compare.included")}</span>
      </>
    ) : v === false ? (
      <>
        <span className="block text-center text-steel" aria-hidden="true">—</span>
        <span className="sr-only">{t("compare.notIncluded")}</span>
      </>
    ) : (
      <span className="block text-center text-[14px] font-medium text-graphite">{t(`compare.values.${v}`)}</span>
    );

  return (
    <>
      <section className="relative overflow-hidden pb-10 pt-14 sm:pt-20">
        <div className="pointer-events-none absolute inset-0 grid-paper [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" aria-hidden="true" />
        <Container className="relative">
          <SectionHeading as="h1" align="center" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
        </Container>
      </section>

      <section aria-label={t("plansLabel")} className="pb-16 sm:pb-24">
        <Container>
          <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((p) => (
              <li
                key={p.id}
                className={`relative flex flex-col rounded-[24px] bg-white p-7 ${
                  p.featured ? "shadow-[var(--shadow-lg)] ring-2 ring-signal" : "ring-1 ring-line"
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-7 rounded-full bg-signal px-3 py-1 text-[12px] font-semibold text-white">
                    {t("featuredBadge")}
                  </span>
                )}
                <h2 className="font-display text-[22px] font-semibold text-ink">{t(`plans.${p.id}.name`)}</h2>
                <p className="mt-2 min-h-[3.25em] text-[14.5px] leading-relaxed text-slate">{t(`plans.${p.id}.tagline`)}</p>
                <div className="mt-6 flex min-h-[44px] items-end">{price(p)}</div>
                <p className="mt-2 text-[13.5px] font-medium text-graphite">{t(`plans.${p.id}.limit`)}</p>
                <ButtonLink
                  href={{ pathname: "/contact", query: { topic: p.id === "basic" ? "demo" : "pricing" } }}
                  variant={p.featured ? "primary" : p.id === "enterprise" ? "dark" : "secondary"}
                  arrow
                  className="mt-6 w-full"
                >
                  {t(`plans.${p.id}.cta`)}
                </ButtonLink>
                <div className="mt-7 border-t border-line pt-6">
                  {p.id !== "basic" && <p className="mb-3 text-[13.5px] font-semibold text-ink">{t(`plans.${p.id}.includes`)}</p>}
                  <ul className="space-y-2.5">
                    {(t.raw(`plans.${p.id}.features`) as string[]).map((f) => (
                      <li key={f} className="flex gap-2.5 text-[14.5px] text-graphite">
                        <Icon name="check" size={17} className="mt-0.5 shrink-0 text-signal" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-[13.5px] text-slate">{t("note")}</p>
        </Container>
      </section>

      <section aria-labelledby="compare-title" className="bg-mist py-16 sm:py-24">
        <Container>
          <h2 id="compare-title" className="font-display text-[clamp(1.6rem,3vw,2.3rem)] font-semibold text-ink">{t("compare.title")}</h2>
          <div className="relative mt-8 overflow-x-auto rounded-[20px] bg-white ring-1 ring-line">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="w-[34%] px-5 py-4 text-[13px] font-medium text-slate">
                    <span className="sr-only">{t("compare.feature")}</span>
                  </th>
                  {PLANS.map((p) => (
                    <th key={p.id} scope="col" className={`px-3 py-4 text-center text-[15px] font-semibold ${p.featured ? "text-signal" : "text-ink"}`}>
                      {t(`plans.${p.id}.name`)}
                    </th>
                  ))}
                </tr>
              </thead>
              {COMPARE.map((g) => (
                <tbody key={g.group}>
                  <tr className="bg-mist/60">
                    <th scope="colgroup" colSpan={5} className="px-5 py-2.5">
                      <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-steel">
                        <Icon name={groupIcon[g.group as keyof typeof groupIcon]} size={14} />
                        {t(`compare.groups.${g.group}`)}
                      </span>
                    </th>
                  </tr>
                  {g.rows.map((r) => (
                    <tr key={r.key} className="border-t border-line">
                      <th scope="row" className="px-5 py-3.5 text-[14.5px] font-medium text-graphite">{t(`compare.rows.${r.key}`)}</th>
                      {r.cells.map((v, i) => (
                        <td key={PLANS[i].id} className="px-3 py-3.5">{cell(v)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </Container>
      </section>

      <section aria-labelledby="faq-title" className="py-16 sm:py-24">
        <Container className="max-w-[860px]">
          <h2 id="faq-title" className="font-display text-[clamp(1.6rem,3vw,2.3rem)] font-semibold text-ink">{t("faqTitle")}</h2>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {faqs.map((n) => (
              <details key={n} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[17px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {t(`faq.q${n}`)}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ring-line transition-transform group-open:rotate-45">
                    <Icon name="plus" size={16} />
                  </span>
                </summary>
                <p className="-mt-2 max-w-[65ch] pb-5 text-[15.5px] leading-relaxed text-slate">{t(`faq.a${n}`)}</p>
              </details>
            ))}
          </div>

          <div className="mt-12 rounded-[24px] bg-ink p-8 text-white sm:p-10">
            <h2 className="font-display text-[clamp(1.4rem,2.6vw,1.9rem)] font-semibold">{t("help.title")}</h2>
            <p className="mt-3 max-w-[55ch] text-[15.5px] leading-relaxed text-white/75">{t("help.body")}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <ButtonLink href={{ pathname: "/contact", query: { topic: "demo" } }} arrow>{c("requestDemo")}</ButtonLink>
              <a href={`mailto:${site.email}`} className="inline-flex min-h-10 items-center text-[14.5px] text-white/80 underline decoration-white/30 underline-offset-4 hover:text-white">{site.email}</a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
