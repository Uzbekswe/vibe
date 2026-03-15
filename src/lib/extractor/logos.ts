import type { CheerioAPI } from "cheerio";
import type { LogoAsset } from "@/types/brand";

export function extractLogos($: CheerioAPI, baseUrl: string): LogoAsset[] {
  const logos: LogoAsset[] = [];
  const seen = new Set<string>();

  function add(url: string, type: LogoAsset["type"], w?: number, h?: number) {
    const resolved = resolveUrl(url, baseUrl);
    if (!resolved || seen.has(resolved)) return;
    seen.add(resolved);
    logos.push({ url: resolved, type, width: w, height: h });
  }

  // favicons
  $('link[rel="icon"], link[rel="shortcut icon"]').each((_, el) => {
    const href = $(el).attr("href");
    const sizes = $(el).attr("sizes");
    const [w, h] = parseSizes(sizes);
    if (href) add(href, "favicon", w, h);
  });

  // apple-touch-icon
  $('link[rel="apple-touch-icon"], link[rel="apple-touch-icon-precomposed"]').each((_, el) => {
    const href = $(el).attr("href");
    const sizes = $(el).attr("sizes");
    const [w, h] = parseSizes(sizes);
    if (href) add(href, "apple-touch-icon", w, h);
  });

  // og:image (can be a logo)
  $('meta[property="og:image"]').each((_, el) => {
    const content = $(el).attr("content");
    if (content) add(content, "og:image");
  });

  // fallback: /favicon.ico
  add("/favicon.ico", "favicon");

  return logos;
}

function resolveUrl(url: string, base: string): string | null {
  try {
    return new URL(url, base).href;
  } catch {
    return null;
  }
}

function parseSizes(sizes?: string): [number | undefined, number | undefined] {
  if (!sizes) return [undefined, undefined];
  const match = sizes.match(/(\d+)x(\d+)/i);
  if (!match) return [undefined, undefined];
  return [parseInt(match[1]), parseInt(match[2])];
}
