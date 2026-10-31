import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

let cache: string | null = null;

/** Concatenate the public knowledge base (src/content/knowledge/*.md, excluding README). */
export function loadKnowledge(): string {
  if (cache) return cache;
  const dir = path.join(process.cwd(), "src/content/knowledge");
  const files = readdirSync(dir).filter((f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md").sort();
  cache = files.map((f) => `<document name="${f}">\n${readFileSync(path.join(dir, f), "utf8").trim()}\n</document>`).join("\n\n");
  return cache;
}
