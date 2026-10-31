// End-to-end smoke checks against a running server.
// Usage: BASE=http://localhost:3100 OUT=/tmp/shots node scripts/verify.mjs
import { chromium } from "playwright";
const base = process.env.BASE ?? "http://localhost:3100";
const out = process.env.OUT ?? "./verify-shots";
const results = [];
const ok = (name, pass, info = "") => { results.push(`${pass ? "PASS" : "FAIL"}  ${name}${info ? " — " + info : ""}`); };
const browser = await chromium.launch();
const errors = [];
async function page(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  const p = await ctx.newPage();
  p.on("console", (m) => { if (m.type() === "error") errors.push(`${p.url()} :: ${m.text().slice(0, 200)}`); });
  p.on("pageerror", (e) => errors.push(`${p.url()} :: pageerror ${e.message}`));
  return p;
}

// 1. Locales render, html lang set, no missing-message markers
for (const l of ["en", "zh", "lo", "th", "vi"]) {
  const p = await page();
  const r = await p.goto(`${base}/${l}`, { waitUntil: "networkidle" });
  const lang = await p.getAttribute("html", "lang");
  const body = await p.textContent("body");
  ok(`home ${l} loads`, r.status() === 200, `lang=${lang}`);
  ok(`home ${l} no raw keys`, !/home\.(hero|story)\.|MISSING_MESSAGE/.test(body));
  await p.screenshot({ path: `${out}/locale-${l}-desktop.png` });
  const m = await page({ viewport: { width: 390, height: 844 } });
  await m.goto(`${base}/${l}/features`, { waitUntil: "networkidle" });
  const overflow = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ok(`features ${l} mobile no horizontal overflow`, overflow <= 0, `overflow=${overflow}px`);
  await m.screenshot({ path: `${out}/locale-${l}-features-mobile.png` });
  for (const path of ["", "/pricing", "/contact"]) {
    await m.goto(`${base}/${l}${path}`, { waitUntil: "networkidle" });
    const of = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    ok(`${l}${path || "/"} mobile no horizontal overflow`, of <= 0, `overflow=${of}px`);
  }
}

// 2. Language switch preserves the page
{
  const p = await page();
  await p.goto(`${base}/en/pricing`, { waitUntil: "networkidle" });
  await p.click('header button[aria-controls]');
  await p.click('header a[lang="th"]');
  await p.waitForURL(/\/th\/pricing/);
  ok("language switch keeps page", p.url().endsWith("/th/pricing"), p.url());
  await p.click('header nav a[href="/th/features"]');
  await p.waitForURL(/\/th\/features/);
  ok("navigation keeps language", p.url().endsWith("/th/features"), p.url());
}

// 3. Internal links resolve; sign-in URL correct
{
  const p = await page();
  await p.goto(`${base}/en`, { waitUntil: "networkidle" });
  const hrefs = [...new Set(await p.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href"))))];
  const internal = hrefs.filter((h) => h.startsWith("/"));
  for (const h of internal) {
    const r = await p.request.get(base + h.split("#")[0]);
    ok(`link ${h}`, r.status() === 200, String(r.status()));
  }
  ok("sign-in link present", hrefs.includes("https://demo.minganji.ai/signin"));
  const bad = hrefs.filter((h) => /register|signup/i.test(h));
  ok("no invented registration links", bad.length === 0, bad.join(","));
}

// 4. Contact form: validation + honest delivery state
{
  const p = await page();
  await p.goto(`${base}/en/contact?topic=pricing`, { waitUntil: "networkidle" });
  ok("topic preselected from URL", await p.isChecked('input[value="pricing"]'));
  await p.click('button[type="submit"]');
  const summary = await p.textContent('[role="alert"]');
  ok("empty submit shows errors", /correct the highlighted/i.test(summary ?? ""));
  ok("aria-invalid on name", (await p.getAttribute("#f-name", "aria-invalid")) === "true");
  await p.screenshot({ path: `${out}/contact-errors.png`, fullPage: true });
  await p.fill("#f-name", "Test Person");
  await p.fill("#f-email", "not-an-email");
  await p.fill("#f-message", "We operate six drilling trucks and want a demo.");
  await p.check("#f-consent");
  await p.click('button[type="submit"]');
  ok("invalid email caught", /valid email/i.test(await p.textContent("body")));
  await p.fill("#f-email", "test@example.com");
  await p.click('button[type="submit"]');
  await p.waitForSelector("text=/isn't available yet|was not sent|has been sent/i", { timeout: 10000 });
  const body = await p.innerText("body");
  ok("no false success without provider", !/has been sent/i.test(body) && /not sent/i.test(body));
  await p.screenshot({ path: `${out}/contact-unavailable.png`, fullPage: true });
}

// 5. Chat widget: open, FAQ fallback (no key), close with Escape
{
  const p = await page({ viewport: { width: 390, height: 844 } });
  await p.goto(`${base}/lo`, { waitUntil: "networkidle" });
  await p.click('button[aria-controls="mj-chat"]');
  await p.waitForSelector("#mj-chat:not([hidden])");
  await p.waitForTimeout(600);
  ok("chat opens", await p.isVisible("#mj-chat"));
  ok("chat input focused", await p.evaluate(() => document.activeElement?.id === "mj-chat-input"));
  await p.screenshot({ path: `${out}/chat-open-lo-mobile.png` });
  const faqMode = await p.isVisible("#mj-chat >> text=FAQ") || (await p.textContent("#mj-chat")).length > 0;
  await p.click("#mj-chat ul button >> nth=1");
  await p.waitForTimeout(500);
  await p.screenshot({ path: `${out}/chat-faq-answer-lo.png` });
  ok("chat answered a suggestion", (await p.$$("#mj-chat .rounded-tl-md")).length >= 2, faqMode ? "" : "");
  await p.fill("#mj-chat-input", "x".repeat(900));
  ok("chat length limit enforced", await p.isDisabled('#mj-chat button[type="submit"]'));
  await p.keyboard.press("Escape");
  // The panel plays a short exit animation before it is hidden.
  ok("Escape closes chat", await p.waitForSelector("#mj-chat", { state: "hidden", timeout: 1000 }).then(() => true, () => false));
  ok("focus returns to launcher", await p.evaluate(() => document.activeElement?.getAttribute("aria-controls") === "mj-chat"));
  const api = await p.request.post(`${base}/api/chat`, { data: { messages: [{ role: "assistant", content: "hi" }], locale: "en" } });
  ok("chat API rejects malformed input", api.status() === 400, String(api.status()));
}

// 6. Reduced motion: static story is shown, animated stage hidden
{
  const p = await page({ reducedMotion: "reduce" });
  await p.goto(`${base}/en`, { waitUntil: "networkidle" });
  ok("reduced motion uses static story", !(await p.isVisible(".story-anim")) && (await p.isVisible("#hero-title-static")));
  await p.screenshot({ path: `${out}/reduced-motion-desktop.png`, fullPage: true });
}

// 7. Keyboard: first Tab reaches skip link
{
  const p = await page();
  await p.goto(`${base}/en`, { waitUntil: "networkidle" });
  await p.keyboard.press("Tab");
  ok("skip link is first tab stop", /skip/i.test(await p.evaluate(() => document.activeElement?.textContent ?? "")));
}

// 8. Theme: System default, toggle, persistence, no flash, keyboard, mobile control
{
  const DARK_BG = "rgb(15, 17, 20)", LIGHT_BG = "rgb(255, 255, 255)";
  const state = (p) => p.evaluate(() => ({
    theme: document.documentElement.getAttribute("data-theme"),
    choice: document.documentElement.getAttribute("data-theme-choice"),
    bg: getComputedStyle(document.body).backgroundColor,
    stored: localStorage.getItem("mj-theme"),
  }));
  // Records every data-theme value <html> ever has, from document creation on
  // (starts with null until the head script runs, before anything is painted).
  const recordThemes = (p) => p.addInitScript(() => {
    window.__themeLog = [];
    const log = () => { const v = document.documentElement?.getAttribute("data-theme"); if (window.__themeLog.at(-1) !== v) window.__themeLog.push(v); };
    new MutationObserver(log).observe(document, { subtree: true, attributes: true, attributeFilter: ["data-theme"], childList: true });
  });

  // System is the default and follows the OS setting.
  const sys = await page({ colorScheme: "dark" });
  await sys.goto(`${base}/en`, { waitUntil: "networkidle" });
  let s = await state(sys);
  ok("theme: System default follows OS dark", s.theme === "dark" && s.choice === "system" && s.bg === DARK_BG, JSON.stringify(s));
  const sysLight = await page({ colorScheme: "light" });
  await sysLight.goto(`${base}/en`, { waitUntil: "networkidle" });
  s = await state(sysLight);
  ok("theme: System default follows OS light", s.theme === "light" && s.choice === "system" && s.bg === LIGHT_BG, JSON.stringify(s));
  ok("theme: no transition class on first load", !(await sysLight.evaluate(() => document.documentElement.classList.contains("theme-transition"))));

  // Toggle on a light OS: choose Dark from the header menu.
  const p = await page({ colorScheme: "light" });
  await recordThemes(p);
  await p.goto(`${base}/en/pricing`, { waitUntil: "networkidle" });
  ok("theme: toggle has accessible name", /Colour theme: System/.test((await p.getAttribute("[data-theme-toggle]", "aria-label")) ?? ""));
  await p.click("[data-theme-toggle]");
  ok("theme: menu opens with current option focused", await p.evaluate(() => document.activeElement?.getAttribute("data-theme-option") === "system" && document.activeElement?.getAttribute("aria-checked") === "true"));
  await p.click('[role=menu] [data-theme-option="dark"]');
  await p.waitForTimeout(1000); // let the 280 ms colour transition finish
  s = await state(p);
  ok("theme: toggle switches to dark", s.theme === "dark" && s.choice === "dark" && s.stored === "dark" && s.bg === DARK_BG, JSON.stringify(s));
  ok("theme: toggle announces the new state", /Colour theme: Dark/.test((await p.getAttribute("[data-theme-toggle]", "aria-label")) ?? ""));
  ok("theme: focus returns to the toggle", await p.evaluate(() => document.activeElement?.hasAttribute("data-theme-toggle")));

  // Reload: dark from the very first attribute value (no flash of light).
  await p.reload({ waitUntil: "networkidle" });
  s = await state(p);
  let log = await p.evaluate(() => window.__themeLog);
  ok("theme: persists after reload", s.theme === "dark" && s.bg === DARK_BG, JSON.stringify(s));
  ok("theme: no flash on reload", log.includes("dark") && !log.includes("light"), JSON.stringify(log));

  // Language switch (client-side re-render of <html>): still dark, never light.
  await p.click("header button[aria-controls]:not([data-theme-toggle])");
  await p.click('header a[lang="th"]');
  await p.waitForURL(/\/th\/pricing/);
  await p.waitForTimeout(1200);
  s = await state(p);
  log = await p.evaluate(() => window.__themeLog);
  ok("theme: persists across language switch", s.theme === "dark" && s.choice === "dark" && s.bg === DARK_BG, JSON.stringify(s));
  ok("theme: no flash on language switch", log.includes("dark") && !log.includes("light"), JSON.stringify(log));
  ok("theme: toggle label translated after switch", /ธีมสี/.test((await p.getAttribute("[data-theme-toggle]", "aria-label")) ?? ""));

  // Before any JavaScript bundle runs, the page is already dark.
  const slow = await page({ colorScheme: "light" });
  await slow.goto(`${base}/en`, { waitUntil: "networkidle" });
  await slow.evaluate(() => localStorage.setItem("mj-theme", "dark"));
  await slow.route(/\/_next\/static\/chunks\/.*\.js/, async (r) => { await new Promise((res) => setTimeout(res, 2500)); await r.continue().catch(() => {}); });
  await slow.goto(`${base}/en/features`, { waitUntil: "domcontentloaded" });
  s = await state(slow);
  const hydrated = await slow.evaluate(() => !!document.querySelector("[data-theme-toggle]")?.getAttribute("aria-label")?.includes("Dark"));
  ok("theme: dark before hydration (no flash)", s.theme === "dark" && s.bg === DARK_BG && !hydrated, JSON.stringify({ ...s, hydrated }));
  await slow.screenshot({ path: `${out}/theme-before-hydration.png` });
  await slow.context().close();

  // Keyboard only: open with Enter, Home = Light, Enter selects, Escape closes.
  const k = await page({ colorScheme: "dark" });
  await k.goto(`${base}/en`, { waitUntil: "networkidle" });
  await k.focus("[data-theme-toggle]");
  await k.keyboard.press("Enter");
  await k.keyboard.press("Home");
  ok("theme: arrow/Home keys move within the menu", await k.evaluate(() => document.activeElement?.getAttribute("data-theme-option") === "light"));
  await k.keyboard.press("Enter");
  await k.waitForTimeout(1000);
  s = await state(k);
  ok("theme: keyboard selects Light", s.theme === "light" && s.bg === LIGHT_BG, JSON.stringify(s));
  await k.keyboard.press("ArrowDown");
  ok("theme: ArrowDown on the button opens the menu", await k.isVisible("[role=menu]"));
  await k.keyboard.press("Escape");
  ok("theme: Escape closes the menu", !(await k.isVisible("[role=menu]")) && await k.evaluate(() => document.activeElement?.hasAttribute("data-theme-toggle")));

  // Mobile menu control (native radios), and System clears the stored choice.
  const m = await page({ viewport: { width: 390, height: 844 }, colorScheme: "light" });
  await m.goto(`${base}/en`, { waitUntil: "networkidle" });
  await m.click('header button[aria-controls="mobile-menu"]');
  await m.click('#mobile-menu label:has([data-theme-option="dark"])');
  await m.waitForTimeout(1000);
  s = await state(m);
  ok("theme: mobile control switches to dark", s.theme === "dark" && s.stored === "dark" && await m.isChecked('#mobile-menu [data-theme-option="dark"]'), JSON.stringify(s));
  await m.screenshot({ path: `${out}/theme-mobile-menu-dark.png` });
  await m.click('#mobile-menu label:has([data-theme-option="system"])');
  await m.waitForTimeout(1000);
  s = await state(m);
  ok("theme: System restores OS setting and clears storage", s.theme === "light" && s.choice === "system" && s.stored === null, JSON.stringify(s));

  // Reduced motion: switching does not animate.
  const r = await page({ reducedMotion: "reduce", colorScheme: "light" });
  await r.goto(`${base}/en`, { waitUntil: "networkidle" });
  await r.click("[data-theme-toggle]");
  await r.click('[role=menu] [data-theme-option="dark"]');
  ok("theme: no colour transition with reduced motion", !(await r.evaluate(() => document.documentElement.classList.contains("theme-transition"))));
}

ok("no console errors", errors.length === 0, `${errors.length} errors`);
console.log(results.join("\n"));
console.log(`\n${results.filter((r) => r.startsWith("FAIL")).length} failed of ${results.length}`);
console.log(errors.length ? "Console errors:\n" + [...new Set(errors)].join("\n") : "No console errors");
await browser.close();
