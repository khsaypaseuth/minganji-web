// Dev helper: screenshot pages and collect console errors.
// Usage: node scripts/shoot.mjs <outDir> <width>x<height> <path>[@scrollY|@full] ... [--reduced]
import { chromium } from "playwright";
const [outDir, size, ...rest] = process.argv.slice(2);
const reduced = rest.includes("--reduced");
const targets = rest.filter((a) => !a.startsWith("--"));
const [w, h] = size.split("x").map(Number);
const base = process.env.BASE ?? "http://localhost:3100";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: reduced ? "reduce" : "no-preference" });
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(`[${m.type()}] ${m.text()}`); });
page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));
let i = 0;
for (const t of targets) {
  const [path, mod] = t.split("@");
  if (page.url() !== base + path) { await page.goto(base + path, { waitUntil: "networkidle" }); await page.waitForTimeout(800); }
  const name = `${outDir}/${String(i++).padStart(2, "0")}-${w}-${path.replace(/[^a-z0-9]+/gi, "_")}-${mod ?? "top"}.png`;
  if (mod === "full") {
    await page.screenshot({ path: name, fullPage: true });
  } else {
    const y = mod ? Number(mod) : 0;
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(1400);
    await page.screenshot({ path: name });
  }
  console.log(name);
}
console.log(errors.length ? errors.join("\n") : "no console errors");
await browser.close();
