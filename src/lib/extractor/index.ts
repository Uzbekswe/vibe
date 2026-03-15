import { load } from "cheerio";
import type { BrandAssets } from "@/types/brand";
import { extractLogos } from "./logos";
import { extractColors } from "./colors";
import { extractImages } from "./images";
import { extractTypography } from "./typography";

export async function extractBrandAssets(url: string): Promise<BrandAssets> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(15000),
    redirect: "follow",
  });

  if (!res.ok) {
    if (res.status === 403) {
      throw new Error(
        `${new URL(url).hostname} blocked the request (403 Forbidden). This site uses bot protection that requires a real browser — try a different site.`
      );
    }
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  const $ = load(html);
  const baseUrl = new URL(url).origin;

  // Extract brand name from <title> or og:site_name
  const brandName =
    $('meta[property="og:site_name"]').attr("content") ??
    ($("title").first().text().split(/[|\-–—]/)[0].trim() || new URL(url).hostname);

  // Run all extractors in parallel
  const logos = extractLogos($, baseUrl);
  const logoUrls = logos.map((l) => l.url);

  const [colors, typography] = await Promise.all([
    extractColors($, baseUrl, logoUrls),
    extractTypography($, baseUrl),
  ]);

  const backdropImages = extractImages($, baseUrl);

  return {
    brand_name: brandName,
    logos,
    colors,
    backdrop_images: backdropImages,
    typography,
  };
}
