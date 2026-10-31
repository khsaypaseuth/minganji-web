import { getTranslations } from "next-intl/server";
import { Container, SectionHeading } from "@/components/ui/Section";
import { ButtonLink, ExternalButton } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/icons/Icon";
import { TruckGlyph, type TruckKind } from "./TruckGlyph";
import { site } from "@/lib/site";

const TRUCKS: TruckKind[] = ["bucket", "insulated", "generator", "drilling", "fire"];

export async function TruckCategories() {
  const t = await getTranslations("home.trucks");
  return (
    <section aria-labelledby="trucks-title" className="bg-mist py-20 sm:py-28">
      <Container>
        <SectionHeading id="trucks-title" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
        <ul className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {TRUCKS.map((k, i) => (
            <li key={k} className="group flex flex-col rounded-[20px] bg-white p-5 ring-1 ring-line transition-shadow duration-300 hover:shadow-[var(--shadow)]">
              <span className="font-mono text-[11px] text-steel">0{i + 1}</span>
              <div className="mx-auto mt-3 w-full max-w-[200px] transition-transform duration-500 ease-out group-hover:-translate-y-0.5">
                <TruckGlyph kind={k} />
              </div>
              <h3 className="mt-5 text-[16px] font-semibold leading-snug text-ink">{t(`items.${k}.name`)}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-slate">{t(`items.${k}.body`)}</p>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[12.5px] text-steel">{t("note")}</p>
      </Container>
    </section>
  );
}

const BENEFITS: { k: string; icon: IconName }[] = [
  { k: "visibility", icon: "map" },
  { k: "records", icon: "cpu" },
  { k: "planning", icon: "clipboard" },
  { k: "management", icon: "chart" },
];

export async function Benefits() {
  const t = await getTranslations("home.benefits");
  return (
    <section aria-labelledby="benefits-title" className="py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
          <SectionHeading id="benefits-title" eyebrow={t("eyebrow")} title={t("title")} />
          <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {BENEFITS.map(({ k, icon }) => (
              <li key={k} className="border-t border-ink/80 pt-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-soft text-signal">
                  <Icon name={icon} size={20} />
                </span>
                <h3 className="mt-5 text-[18px] font-semibold text-ink">{t(`items.${k}.title`)}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate">{t(`items.${k}.body`)}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

export async function ClosingCta({ titleKey = "home.cta.title", bodyKey = "home.cta.body" }: { titleKey?: string; bodyKey?: string }) {
  const t = await getTranslations();
  return (
    <section aria-labelledby="cta-title" className="px-3 pb-3 sm:px-5 sm:pb-5">
      <div className="relative overflow-hidden rounded-[28px] bg-ink px-6 py-16 text-white sm:px-12 sm:py-20">
        <svg className="pointer-events-none absolute -right-20 -top-20 h-[420px] w-[420px] opacity-[0.16]" viewBox="0 0 200 200" aria-hidden="true">
          {[30, 55, 80, 100].map((r) => <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="#fff" strokeWidth="0.6" />)}
          <circle cx="100" cy="100" r="6" fill="#d7261e" />
        </svg>
        <div className="relative mx-auto max-w-[1180px]">
          <h2 id="cta-title" className="font-display max-w-[20ch] text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.05]">{t(titleKey)}</h2>
          <p className="mt-4 max-w-[52ch] text-[16.5px] leading-relaxed text-white/70">{t(bodyKey)}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href={{ pathname: "/contact", query: { topic: "demo" } }} size="lg" arrow>
              {t("common.requestDemo")}
            </ButtonLink>
            <ExternalButton href={site.signInUrl} variant="secondary" size="lg" newTabLabel={t("common.opensInNewTab")} className="!bg-transparent !text-white !ring-white/30 hover:!bg-white/10">
              {t("common.signIn")}
            </ExternalButton>
          </div>
        </div>
      </div>
    </section>
  );
}
