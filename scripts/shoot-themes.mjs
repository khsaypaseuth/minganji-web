// Dev helper: screenshot key views in light and dark themes.
// Usage: BASE=http://localhost:3000 node scripts/shoot-themes.mjs <outDir> [light|dark ...]
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const base = process.env.BASE ?? "http://localhost:3000";
const out = process.argv[2] ?? "./theme-shots";
const themes = process.argv.slice(3).length ? process.argv.slice(3) : ["light", "dark"];
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const errors = [];

async function open(theme, viewport = { width: 1440, height: 900 }) {
  // The OS preference drives the default "System" choice.
  const ctx = await browser.newContext({ viewport, colorScheme: theme, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  p.on("console", (m) => { if (m.type() === "error") errors.push(`[${theme}] ${p.url()} :: ${m.text().slice(0, 300)}`); });
  p.on("pageerror", (e) => errors.push(`[${theme}] pageerror ${e.message}`));
  return p;
}
const settle = (p, ms = 1500) => p.waitForTimeout(ms);
async function toStep(p, id, extra = 0) {
  await p.evaluate(([id, extra]) => {
    const el = document.getElementById(id);
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + extra);
  }, [id, extra]);
  await settle(p, 2600);
}

for (const theme of themes) {
  const p = await open(theme);
  await p.goto(`${base}/en`, { waitUntil: "networkidle" });
  await settle(p, 2800);
  await p.screenshot({ path: `${out}/${theme}-home-hero.png` });
  await toStep(p, "step-sensors", 100);
  await p.screenshot({ path: `${out}/${theme}-story-sensors.png` });
  await toStep(p, "step-controller", 100);
  await p.screenshot({ path: `${out}/${theme}-story-controller.png` });
  await toStep(p, "step-platform", 100);
  await p.screenshot({ path: `${out}/${theme}-story-map.png` });
  await toStep(p, "step-plan", 100);
  await p.screenshot({ path: `${out}/${theme}-story-plan.png` });
  await toStep(p, "step-manage", 200);
  await p.screenshot({ path: `${out}/${theme}-story-management.png` });
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await settle(p, 1500);
  await p.screenshot({ path: `${out}/${theme}-home-bottom.png`, fullPage: false });

  for (const [path, name] of [["/en/features", "features"], ["/en/pricing", "pricing"], ["/en/contact", "contact"]]) {
    await p.goto(`${base}${path}`, { waitUntil: "networkidle" });
    // Reveal everything (scroll through once) before a full-page shot.
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } window.scrollTo(0, 0); });
    await settle(p, 1800);
    await p.screenshot({ path: `${out}/${theme}-${name}.png`, fullPage: true });
  }
  // Contact errors state
  await p.click('button[type="submit"]');
  await settle(p, 600);
  await p.screenshot({ path: `${out}/${theme}-contact-errors.png` });

  // Chat open (desktop)
  await p.goto(`${base}/en`, { waitUntil: "networkidle" });
  await settle(p, 2200);
  await p.click('button[aria-controls="mj-chat"]');
  await settle(p, 900);
  await p.click("#mj-chat ul button >> nth=0");
  await settle(p, 1200);
  await p.screenshot({ path: `${out}/${theme}-chat.png` });

  // Theme menu open
  await p.keyboard.press("Escape");
  await settle(p, 500);
  await p.click("[data-theme-toggle]");
  await settle(p, 300);
  await p.screenshot({ path: `${out}/${theme}-theme-menu.png`, clip: { x: 900, y: 0, width: 540, height: 300 } });

  // Mobile: static story and menu
  const m = await open(theme, { width: 390, height: 844 });
  await m.goto(`${base}/en`, { waitUntil: "networkidle" });
  await settle(m, 1500);
  await m.screenshot({ path: `${out}/${theme}-mobile-home.png` });
  await m.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)); } window.scrollTo(0, 0); });
  await settle(m, 2500);
  await m.screenshot({ path: `${out}/${theme}-mobile-home-full.png`, fullPage: true });
  await m.click('header button[aria-controls="mobile-menu"]');
  await settle(m, 500);
  await m.screenshot({ path: `${out}/${theme}-mobile-menu.png` });
  await m.context().close();
  await p.context().close();
}

console.log(errors.length ? "Console errors:\n" + [...new Set(errors)].join("\n") : "No console errors");
await browser.close();
