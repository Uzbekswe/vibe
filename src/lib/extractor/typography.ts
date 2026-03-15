import type { CheerioAPI } from "cheerio";
import * as csstree from "css-tree";
import type { TypographyAsset } from "@/types/brand";

interface FontAccumulator {
  weights: Set<number>;
  sizes: Set<string>;
  contexts: Set<TypographyAsset["context"]>;
  source: TypographyAsset["source"];
}

export async function extractTypography(
  $: CheerioAPI,
  baseUrl: string
): Promise<TypographyAsset[]> {
  const fonts = new Map<string, FontAccumulator>();

  // 1. Google Fonts from <link> tags
  $('link[href*="fonts.googleapis.com"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const families = parseGoogleFontsUrl(href);
    for (const { family, weights } of families) {
      const acc = getOrCreate(fonts, family, "google-fonts");
      for (const w of weights) acc.weights.add(w);
    }
  });

  // 2. Fetch and parse linked CSS stylesheets
  const cssUrls: string[] = [];
  $('link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href && !href.includes("fonts.googleapis.com")) {
      try {
        cssUrls.push(new URL(href, baseUrl).href);
      } catch {
        // invalid URL
      }
    }
  });

  const cssResults = await Promise.allSettled(
    cssUrls.slice(0, 10).map(async (url) => {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36" },
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) return "";
      return res.text();
    })
  );

  for (const result of cssResults) {
    if (result.status === "fulfilled" && result.value) {
      parseCssForFonts(result.value, fonts);
    }
  }

  // 3. Inline <style> blocks
  $("style").each((_, el) => {
    const css = $(el).text();
    if (css) parseCssForFonts(css, fonts);
  });

  // Convert to TypographyAsset[], filtering out junk entries
  return Array.from(fonts.entries())
    .filter(([family]) => !isJunkFont(family))
    .map(([family, acc]) => ({
      family,
      weights: Array.from(acc.weights).sort((a, b) => a - b),
      sizes: Array.from(acc.sizes),
      context: pickPrimaryContext(acc.contexts),
      source: acc.source,
    }));
}

function getOrCreate(
  map: Map<string, FontAccumulator>,
  family: string,
  source: TypographyAsset["source"]
): FontAccumulator {
  const key = family.toLowerCase();
  let acc = map.get(key);
  if (!acc) {
    acc = { weights: new Set(), sizes: new Set(), contexts: new Set(), source };
    map.set(key, acc);
  }
  return acc;
}

function parseCssForFonts(css: string, fonts: Map<string, FontAccumulator>) {
  let ast: csstree.CssNode;
  try {
    ast = csstree.parse(css, { parseCustomProperty: false });
  } catch (err) {
    console.warn("[typography] CSS parse error:", err instanceof Error ? err.message : err);
    return;
  }

  csstree.walk(ast, {
    visit: "Rule",
    enter(node) {
      if (node.type !== "Rule" || !node.prelude || !node.block) return;

      const selector = csstree.generate(node.prelude);
      const context = selectorToContext(selector);

      let fontFamily: string | null = null;
      let fontWeight: number | null = null;
      let fontSize: string | null = null;

      node.block.children.forEach((decl) => {
        if (decl.type !== "Declaration") return;
        const prop = decl.property.toLowerCase();
        const value = csstree.generate(decl.value);

        if (prop === "font-family") {
          fontFamily = value.split(",")[0].replace(/['"]/g, "").trim();
        } else if (prop === "font-weight") {
          const w = parseWeight(value);
          if (w) fontWeight = w;
        } else if (prop === "font-size") {
          fontSize = value;
        }
      });

      if (fontFamily) {
        const acc = getOrCreate(fonts, fontFamily, "css");
        if (fontWeight) acc.weights.add(fontWeight);
        if (fontSize) acc.sizes.add(fontSize);
        acc.contexts.add(context);
      }
    },
  });
}

function selectorToContext(selector: string): TypographyAsset["context"] {
  const s = selector.toLowerCase();
  if (/\bh[1-6]\b/.test(s)) return "heading";
  if (/\b(p|body|\.text|\.content)\b/.test(s)) return "body";
  if (/\b(nav|\.nav|\.menu|\.header)\b/.test(s)) return "nav";
  return "other";
}

function parseWeight(value: string): number | null {
  const num = parseInt(value);
  if (!isNaN(num)) return num;
  const map: Record<string, number> = {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  };
  return map[value.toLowerCase().replace(/[- ]/g, "")] ?? null;
}

const JUNK_FAMILIES = new Set([
  "inherit", "initial", "unset", "normal", "none", "auto",
  "sans-serif", "serif", "monospace", "cursive", "fantasy", "system-ui",
  "ui-sans-serif", "ui-serif", "ui-monospace", "ui-rounded",
  "-apple-system", "blinkmacsystemfont", "segoe ui", "helvetica",
  "arial", "helvetica neue", "noto sans", "liberation sans",
  "apple color emoji", "segoe ui emoji", "segoe ui symbol",
  "noto color emoji", "roboto", "oxygen", "ubuntu", "cantarell",
  "fira sans", "droid sans",
]);

function isJunkFont(family: string): boolean {
  const lower = family.toLowerCase().trim();
  if (JUNK_FAMILIES.has(lower)) return true;
  if (lower.startsWith("var(--")) return true;
  if (lower.startsWith("-")) return true;
  if (/emoji|symbol/i.test(lower)) return true;
  return false;
}

function pickPrimaryContext(
  contexts: Set<TypographyAsset["context"]>
): TypographyAsset["context"] {
  if (contexts.has("heading")) return "heading";
  if (contexts.has("body")) return "body";
  if (contexts.has("nav")) return "nav";
  return "other";
}

function parseGoogleFontsUrl(
  href: string
): { family: string; weights: number[] }[] {
  try {
    const url = new URL(href);
    const familyParam = url.searchParams.get("family");
    if (!familyParam) return [];

    return familyParam.split("|").map((entry) => {
      const [name, rest] = entry.split(":");
      const family = name.replace(/\+/g, " ");
      const weights: number[] = [];
      if (rest) {
        for (const part of rest.split(",")) {
          const w = parseInt(part);
          if (!isNaN(w)) weights.push(w);
        }
      }
      if (weights.length === 0) weights.push(400);
      return { family, weights };
    });
  } catch (err) {
    console.warn("[typography] Google Fonts URL parse error:", err instanceof Error ? err.message : err);
    return [];
  }
}
