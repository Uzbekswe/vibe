import type { CheerioAPI } from "cheerio";
import type { BackdropAsset } from "@/types/brand";

const MAX_BACKGROUND_IMAGES = 3;

export function extractImages($: CheerioAPI, baseUrl: string): BackdropAsset[] {
  const images: BackdropAsset[] = [];
  const seen = new Set<string>();

  function add(url: string, source: BackdropAsset["source"], alt?: string) {
    if (images.length >= MAX_BACKGROUND_IMAGES) return;
    const resolved = resolveUrl(url, baseUrl);
    if (!resolved || seen.has(resolved)) return;
    // skip tiny icons, svgs, and data URIs
    if (resolved.endsWith(".svg") || resolved.startsWith("data:")) return;
    seen.add(resolved);
    images.push({ url: resolved, source, alt });
  }

  // og:image — the primary brand/social image
  $('meta[property="og:image"]').each((_, el) => {
    const content = $(el).attr("content");
    if (content) add(content, "og:image", "Open Graph image");
  });

  // twitter:image
  $('meta[name="twitter:image"]').each((_, el) => {
    const content = $(el).attr("content");
    if (content) add(content, "og:image", "Twitter card image");
  });

  // hero images — only from explicitly marked hero/banner sections
  const heroSelectors = [
    '[class*="hero"] img',
    '[class*="banner"] img',
    '[id*="hero"] img',
    '[id*="banner"] img',
  ];

  for (const selector of heroSelectors) {
    $(selector).each((_, el) => {
      const src = $(el).attr("src");
      const alt = $(el).attr("alt");
      if (src) add(src, "hero", alt ?? undefined);
    });
  }

  return images;
}

function resolveUrl(url: string, base: string): string | null {
  try {
    return new URL(url, base).href;
  } catch {
    return null;
  }
}
