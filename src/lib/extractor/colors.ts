import type { CheerioAPI } from "cheerio";
import sharp from "sharp";
import type { ColorAsset } from "@/types/brand";

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export async function extractColors(
  $: CheerioAPI,
  baseUrl: string,
  logoUrls: string[]
): Promise<ColorAsset[]> {
  const colors: ColorAsset[] = [];
  const seen = new Set<string>();

  function add(hex: string, source: ColorAsset["source"], context?: string) {
    const normalized = hex.toLowerCase();
    if (seen.has(normalized)) return;
    seen.add(normalized);
    colors.push({ hex: normalized, source, context });
  }

  // theme-color meta tag
  const themeColor = $('meta[name="theme-color"]').attr("content");
  if (themeColor) add(themeColor, "theme-color");

  // msapplication-TileColor
  const tileColor = $('meta[name="msapplication-TileColor"]').attr("content");
  if (tileColor) add(tileColor, "theme-color", "tile");

  // manifest.json colors
  try {
    const manifestHref = $('link[rel="manifest"]').attr("href");
    if (manifestHref) {
      const manifestUrl = new URL(manifestHref, baseUrl).href;
      const res = await fetch(manifestUrl, { headers: { "User-Agent": BROWSER_UA } });
      if (res.ok) {
        const manifest = await res.json();
        if (manifest.theme_color) add(manifest.theme_color, "manifest", "theme");
        if (manifest.background_color) add(manifest.background_color, "manifest", "background");
      }
    }
  } catch {
    // manifest fetch failed, skip
  }

  // dominant color from first logo
  for (const logoUrl of logoUrls.slice(0, 2)) {
    try {
      const res = await fetch(logoUrl, { headers: { "User-Agent": BROWSER_UA } });
      if (!res.ok) continue;
      const buffer = Buffer.from(await res.arrayBuffer());
      const { dominant } = await sharp(buffer).stats();
      const hex = rgbToHex(dominant.r, dominant.g, dominant.b);
      add(hex, "dominant", "logo");
    } catch {
      // skip failed image
    }
  }

  return colors;
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")
  );
}
