// Verifies every locale file has exactly the same keys (and array lengths) as en.json.
// Usage: node scripts/check-i18n.mjs
import { readFileSync } from "node:fs";
const locales = ["en", "zh", "lo", "th", "vi"];
const load = (l) => JSON.parse(readFileSync(new URL(`../messages/${l}.json`, import.meta.url), "utf8"));
const flat = (o, p = "", out = {}) => {
  for (const [k, v] of Object.entries(o)) {
    const key = p ? `${p}.${k}` : k;
    if (v && typeof v === "object") flat(v, key, out);
    else out[key] = v;
  }
  return out;
};
const base = flat(load("en"));
let failed = false;
for (const l of locales.slice(1)) {
  let other;
  try { other = flat(load(l)); } catch (e) { console.error(`✗ ${l}: ${e.message}`); failed = true; continue; }
  const missing = Object.keys(base).filter((k) => !(k in other));
  const extra = Object.keys(other).filter((k) => !(k in base));
  const placeholders = Object.keys(base).filter((k) => k in other && String(base[k]).match(/\{\w+\}/g)?.join() !== String(other[k]).match(/\{\w+\}/g)?.join());
  const empty = Object.keys(other).filter((k) => String(other[k]).trim() === "");
  if (missing.length || extra.length || placeholders.length || empty.length) {
    failed = true;
    console.error(`✗ ${l}: missing ${missing.length}, extra ${extra.length}, placeholder mismatch ${placeholders.length}, empty ${empty.length}`);
    [...missing.map((k) => `  missing: ${k}`), ...extra.map((k) => `  extra: ${k}`), ...placeholders.map((k) => `  placeholder: ${k}`), ...empty.map((k) => `  empty: ${k}`)].slice(0, 40).forEach((m) => console.error(m));
  } else console.log(`✓ ${l}: ${Object.keys(other).length} keys`);
}
process.exit(failed ? 1 : 0);
