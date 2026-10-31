import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container, IllustrativeTag, SectionHeading } from "@/components/ui/Section";
import { ClosingCta } from "@/components/home/HomeSections";
import { buildDashLabels } from "@/components/story/Dashboard";
import { BusinessPreview, MappingPreview, MonitoringPreview, PlanningPreview, StaffPreview } from "@/components/features/Previews";
import { Icon, type IconName } from "@/components/icons/Icon";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("featuresTitle"), description: t("featuresDescription"), alternates: { canonical: `/${locale}/features` } };
}

/**
 * status: "available" = described on the current public site / MVP portal and in the brief.
 *         "confirm"   = listed in the brief, but public evidence is limited — confirm scope before launch.
 * See HANDOFF.md → "Feature evidence".
 */
const AREAS: { k: string; icon: IconName; status: "available" | "confirm"; Preview: typeof MonitoringPreview }[] = [
  { k: "monitoring", icon: "gauge", status: "available", Preview: MonitoringPreview },
  { k: "mapping", icon: "map", status: "available", Preview: MappingPreview },
  { k: "planning", icon: "layers", status: "available", Preview: PlanningPreview },
  { k: "staff", icon: "users", status: "confirm", Preview: StaffPreview },
  { k: "business", icon: "chart", status: "confirm", Preview: BusinessPreview },
];

export default async function FeaturesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("features");
  const tr = await getTranslations();
  const d = buildDashLabels(await getTranslations("home.story.dash"), await getTranslations("features.preview"), await getTranslations("common"));
  const p = await getTranslations("features.preview");

  return (
    <>
      <section className="relative overflow-hidden pb-10 pt-14 sm:pt-20">
        <div className="pointer-events-none absolute inset-0 grid-paper [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" aria-hidden="true" />
        <Container className="relative">
          <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
          <nav aria-label={t("jumpTo")} className="no-scrollbar -mx-5 mt-10 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <ol className="flex w-max gap-2">
              {AREAS.map(({ k, icon }, i) => (
                <li key={k}>
                  <a href={`#${k}`} className="flex items-center gap-2 rounded-full bg-white py-2 pl-2 pr-4 text-[14px] font-medium text-graphite ring-1 ring-line transition hover:ring-ink/30">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mist text-ink"><Icon name={icon} size={15} /></span>
                    <span className="font-mono text-[11px] text-steel">0{i + 1}</span>
                    {t(`areas.${k}.nav`)}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <p className="mt-6 flex items-start gap-2 text-[13px] text-steel"><Icon name="info" size={16} className="mt-0.5 shrink-0" />{t("legend")}</p>
        </Container>
      </section>

      {AREAS.map(({ k, icon, status, Preview }, i) => (
        <section key={k} id={k} aria-labelledby={`${k}-title`} className={`scroll-mt-24 py-16 sm:py-24 ${i % 2 === 0 ? "bg-mist" : "bg-white"}`}>
          <Container>
            <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
              <div className="lg:sticky lg:top-28">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-white"><Icon name={icon} size={20} /></span>
                  <span className="font-mono text-[12px] text-steel">0{i + 1} / 05</span>
                </div>
                <h2 id={`${k}-title`} className="font-display mt-6 text-[clamp(1.7rem,3vw,2.4rem)] font-semibold leading-[1.1] text-ink">{t(`areas.${k}.title`)}</h2>
                <p className="mt-4 text-[16.5px] leading-relaxed text-slate">{t(`areas.${k}.summary`)}</p>
                <p className="mt-6 text-[12px] font-medium uppercase tracking-[0.1em] text-steel">{t("details")}</p>
                <ul className="mt-3 space-y-2.5">
                  {(t.raw(`areas.${k}.points`) as string[]).map((pt) => (
                    <li key={pt} className="flex gap-3 text-[15px] text-graphite">
                      <Icon name="check" size={18} className="mt-0.5 shrink-0 text-signal" />
                      {pt}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12.5px] ring-1 ring-line">
                  <span className="sr-only">{t("statusLabel")}: </span>
                  <span className={`h-2 w-2 rounded-full ${status === "available" ? "bg-ok" : "bg-[#e0a325]"}`} aria-hidden="true" />
                  {t(`status.${status}`)}
                </p>
              </div>
              <div>
                <div className="mb-3 flex justify-end"><IllustrativeTag>{tr("common.illustrativeInterface")}</IllustrativeTag></div>
                <Preview d={d} p={(x) => p(x)} diagram={k === "monitoring" ? t("areas.monitoring.diagram") : undefined} />
              </div>
            </div>
          </Container>
        </section>
      ))}

      <div className="pt-16 sm:pt-24">
        <ClosingCta titleKey="features.cta.title" bodyKey="features.cta.body" />
      </div>
    </>
  );
}
