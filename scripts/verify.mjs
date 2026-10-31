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

console.log(results.join("\n"));
console.log(`\n${results.filter((r) => r.startsWith("FAIL")).length} failed of ${results.length}`);
console.log(errors.length ? "Console errors:\n" + [...new Set(errors)].join("\n") : "No console errors");
await browser.close();
