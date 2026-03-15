# BrandScan — CLAUDE.md
> Reference: reverse-engineered from https://github.com/ethanjyx/openbrand
> Differentiator: adds typography extraction (fonts, weights, sizes)

## What this project is
Brand asset extractor. Given a URL, return logos, colors, backdrop images,
brand name, AND typography (fonts, weights, sizes). Typography is the
differentiator vs OpenBrand (which doesn't do it).

## Stack
- Next.js 14 App Router, TypeScript, Tailwind CSS
- Cheerio — HTML parsing (no headless browser needed)
- Sharp — dominant color extraction from logo images
- css-tree — parse fetched CSS stylesheets for typography

## Key design decisions
- NO Playwright/Puppeteer. Metadata-first: og tags, manifest.json, link tags.
- All extractors run in parallel via Promise.all
- Typography: fetch linked CSS files → parse with css-tree → group by
  selector context (h1-h6 = heading, p/body = body, nav = navigation)
- Google Fonts: detect from <link href="fonts.googleapis.com"> and parse
  the family name from the URL query string

## Folder structure
src/
  lib/extractor/
    logos.ts      — favicon, apple-touch-icon, og:image logo candidates
    colors.ts     — theme-color, manifest, Sharp dominant color
    images.ts     — backdrop/hero images
    typography.ts — CSS fetch + parse, font categorization
    index.ts      — orchestrates all, returns BrandAssets
  app/api/extract/
    route.ts      — POST handler
  types/
    brand.ts      — all TypeScript types
  components/
    LogoGrid.tsx, ColorSwatches.tsx, FontPreview.tsx, ResultCard.tsx

## Types (define these first)
BrandAssets { brand_name, logos: LogoAsset[], colors: ColorAsset[],
  backdrop_images: BackdropAsset[], typography: TypographyAsset[] }
TypographyAsset { family, weights: number[], sizes: string[],
  context: 'heading'|'body'|'nav'|'other', source: 'google-fonts'|'css'|'system' }

## Build order
1. Types → 2. Extractors → 3. API route → 4. UI
