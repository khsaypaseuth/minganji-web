"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SCENES, STATES, TRUCK_VIEW, type StateKey, type Vars } from "./states";
import { StoryStage } from "./StoryStage";
import { ButtonLink } from "@/components/ui/Button";
import { IllustrativeTag } from "@/components/ui/Section";

const STEP_KEYS = ["truck", "sensors", "controller", "platform", "plan", "manage"] as const;

function toGsap(v: Vars) {
  const { opacity, ...rest } = v;
  return opacity === undefined ? rest : { ...rest, autoAlpha: opacity };
}

function HeroCopy({ titleId }: { titleId?: string }) {
  const t = useTranslations();
  return (
    <div className="hero-in">
      <p className="eyebrow">{t("home.hero.eyebrow")}</p>
      <h1 id={titleId} className="font-display mt-5 text-[clamp(2.4rem,5.2vw,4.4rem)] font-semibold leading-[1.02] text-ink">
        {t("home.hero.title")}
      </h1>
      <p className="mt-6 max-w-[52ch] text-[17.5px] leading-relaxed text-slate">{t("home.hero.lead")}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href={{ pathname: "/contact", query: { topic: "demo" } }} size="lg" arrow>
          {t("common.requestDemo")}
        </ButtonLink>
        <ButtonLink href="/features" variant="secondary" size="lg">
          {t("common.exploreFeatures")}
        </ButtonLink>
      </div>
    </div>
  );
}

function StepCopy({ k, heading = "h3" }: { k: (typeof STEP_KEYS)[number]; heading?: "h2" | "h3" }) {
  const t = useTranslations("home.story.steps");
  const H = heading;
  return (
    <>
      <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-signal">{t(`${k}.kicker`)}</p>
      <H className="font-display mt-3 text-[clamp(1.6rem,2.6vw,2.25rem)] font-semibold leading-[1.1] text-ink">{t(`${k}.title`)}</H>
      <p className="mt-4 max-w-[46ch] text-[16.5px] leading-relaxed text-slate">{t(`${k}.body`)}</p>
    </>
  );
}

function Closing() {
  const t = useTranslations();
  return (
    <div className="mt-10 rounded-[20px] bg-ink p-7 text-white">
      <p className="font-display text-[22px] font-semibold">{t("home.story.closing.title")}</p>
      <p className="mt-2 text-[15px] leading-relaxed text-white/70">{t("home.story.closing.body")}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <ButtonLink href={{ pathname: "/contact", query: { topic: "demo" } }} arrow>
          {t("common.requestDemo")}
        </ButtonLink>
        <ButtonLink href="/features" variant="secondary" className="!bg-transparent !text-white !ring-white/30 hover:!bg-white/10">
          {t("common.exploreFeatures")}
        </ButtonLink>
      </div>
    </div>
  );
}

/** Text chips shown under static frames so labels stay readable on small screens. */
function FrameChips({ scene }: { scene: number }) {
  const t = useTranslations("home.story.labels");
  const sets: Record<number, string[]> = {
    1: [`${t("gnss")} (${t("gnssNote")})`, t("boom"), t("drill"), t("hours")],
    2: [t("location"), t("hoursShort"), t("activity"), t("controller")],
  };
  const items = sets[scene];
  if (!items) return null;
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {items.map((x) => (
        <li key={x} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] text-graphite ring-1 ring-line">
          <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
          {x}
        </li>
      ))}
    </ul>
  );
}

export function Story() {
  const t = useTranslations();
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const root = rootRef.current!;
      const q = gsap.utils.selector(stageRef.current);
      root.dataset.anim = "on";

      // Start from scene 0 explicitly.
      for (const [k, v] of Object.entries(STATES[0])) gsap.set(q(`[data-k="${k}"]`), toGsap(v!));
      gsap.set(q("[data-k]"), { transformOrigin: "0 0" });

      const tl = gsap.timeline({ paused: true, defaults: { duration: 0.5, ease: "power2.inOut" } });
      for (let i = 1; i < STATES.length; i++) {
        const at = i - 0.6;
        if (TRUCK_VIEW[i] !== TRUCK_VIEW[i - 1]) tl.to(q("[data-truck-svg]"), { attr: { viewBox: TRUCK_VIEW[i] } }, at);
        for (const [k, v] of Object.entries(STATES[i]) as [StateKey, Vars][]) {
          if (k === "holesDone" && v.opacity === 1) {
            tl.set(q(`[data-k="holesDone"]`), { autoAlpha: 1 }, at);
            tl.fromTo(q(`[data-k="holesDone"] [data-hole]`), { opacity: 0 }, { opacity: 1, stagger: 0.05, duration: 0.25 }, at + 0.1);
          } else if (k === "tiles" && v.opacity === 1) {
            tl.set(q(`[data-k="tiles"]`), { autoAlpha: 1, y: 0 }, at);
            tl.fromTo(q("[data-tile]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.35 }, at + 0.15);
          } else {
            tl.to(q(`[data-k="${k}"]`), toGsap(v), at);
          }
        }
      }
      tl.set({}, {}, STATES.length - 1);

      const main = ScrollTrigger.create({
        trigger: stepsRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        animation: tl,
      });

      const steps = gsap.utils.toArray<HTMLElement>("[data-step]", root);
      const dots = gsap.utils.toArray<HTMLElement>("[data-dot]", root);
      const triggers = steps.map((el, i) =>
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 45%",
          onToggle: (self) => {
            el.classList.toggle("is-active", self.isActive);
            if (self.isActive) dots.forEach((d, j) => d.toggleAttribute("data-active", j === i));
          },
        }),
      );
      return () => {
        main.kill();
        triggers.forEach((x) => x.kill());
        delete root.dataset.anim;
        steps.forEach((s) => s.classList.remove("is-active"));
        gsap.set(q("[data-k], [data-hole], [data-tile], [data-truck-svg]"), { clearProps: "all" });
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <section className="relative">
      {/* ---------- Desktop: sticky stage + scroll-driven story ---------- */}
      <div ref={rootRef} className="story-anim relative hidden lg:motion-safe:block">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[120vh] grid-paper [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-[1320px] grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 px-8">
          <ol ref={stepsRef} className="relative">
            {STEP_KEYS.map((k, i) => (
              <li
                key={k}
                id={`step-${k}`}
                data-step
                className={`story-step flex flex-col justify-center transition-opacity duration-500 ${i === 0 ? "min-h-[calc(100vh-var(--header-h))] pb-16" : "min-h-screen"}`}
              >
                {i === 0 ? (
                  <>
                    <HeroCopy titleId="hero-title" />
                    <div className="mt-14 flex items-center gap-3 text-[13px] text-steel">
                      <span className="flex h-9 w-6 justify-center rounded-full ring-1 ring-line-strong" aria-hidden="true">
                        <span className="mt-2 h-2 w-0.5 animate-bounce rounded-full bg-signal" />
                      </span>
                      {t("home.hero.scrollHint")}
                    </div>
                  </>
                ) : (
                  <>
                    {i === 1 && (
                      <div className="mb-12">
                        <p className="eyebrow">{t("home.story.eyebrow")}</p>
                        <h2 className="font-display mt-2 text-[15px] font-semibold text-slate">{t("home.story.title")}</h2>
                      </div>
                    )}
                    <StepCopy k={k} />
                    {i === STEP_KEYS.length - 1 && <Closing />}
                  </>
                )}
              </li>
            ))}
          </ol>

          <div className="relative">
            <div className="sticky top-[var(--header-h)] flex h-[calc(100vh-var(--header-h))] items-center">
              <div className="relative w-full">
                <div ref={stageRef} className="relative">
                  <StoryStage scene={0} />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <IllustrativeTag>{t("common.illustrativeInterface")}</IllustrativeTag>
                  <nav aria-label={t("home.story.eyebrow")}>
                    <ol className="flex items-center gap-2">
                      {STEP_KEYS.map((k, i) => (
                        <li key={k}>
                          <a
                            href={`#step-${k}`}
                            data-dot
                            {...(i === 0 ? { "data-active": "" } : {})}
                            aria-label={t(`home.story.steps.${k}.title`)}
                            className="block h-2 w-2 rounded-full bg-line-strong transition-all duration-300 hover:bg-steel data-[active]:w-6 data-[active]:bg-signal"
                          />
                        </li>
                      ))}
                    </ol>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Mobile, tablet and reduced motion: complete static story ---------- */}
      <div className="lg:motion-safe:hidden">
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 grid-paper [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden="true" />
          <div className="relative mx-auto max-w-[1240px] px-5 pb-10 pt-10 sm:px-8 sm:pt-16 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
            <HeroCopy titleId="hero-title-static" />
            <div className="mt-10 lg:mt-0">
              <StoryStage scene={0} />
              <div className="mt-2"><IllustrativeTag>{t("common.illustrative")}</IllustrativeTag></div>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-[1240px] px-5 pb-8 sm:px-8">
          <div className="border-t border-line pt-12">
            <p className="eyebrow">{t("home.story.eyebrow")}</p>
            <h2 className="font-display mt-3 text-[clamp(1.7rem,4vw,2.4rem)] font-semibold leading-tight text-ink">{t("home.story.title")}</h2>
          </div>
          <ol className="mt-8 space-y-12 sm:space-y-16">
            {SCENES.map((k, i) => (
              <li key={k} className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-12">
                <div>
                  <StepCopy k={k} />
                  {i === SCENES.length - 1 && <div className="hidden lg:block"><Closing /></div>}
                </div>
                <div>
                  <div className="rounded-[22px] bg-mist p-3 ring-1 ring-line sm:p-5">
                    <StoryStage scene={i} />
                  </div>
                  <FrameChips scene={i} />
                </div>
                {i === SCENES.length - 1 && <div className="lg:hidden"><Closing /></div>}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
