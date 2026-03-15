# Vibe

Extract the vibe of any brand — logos, colors, typography, backdrop images, and brand name — from any website URL.

**Live demo:** [brand-logos.vercel.app](https://brand-logos.vercel.app)

## What it extracts

- **Logos** — favicons, apple-touch-icons, SVGs, and og:image logos
- **Brand colors** — from meta tags, manifest.json, and dominant color analysis of logo images
- **Typography** — font families, weights, sizes, and context (heading, body, navigation) parsed from linked CSS and Google Fonts
- **Backdrop images** — og:image, hero banners, and large background images
- **Brand name** — extracted from og:site_name, page title, or hostname

Typography extraction is a differentiator — most brand extraction tools skip it entirely.

## Getting started

### As a web app

Go to [brand-logos.vercel.app](https://brand-logos.vercel.app), type a URL, and hit Extract. No login required.

### As an API call

Get your free API key from [brand-logos.vercel.app/dashboard](https://brand-logos.vercel.app/dashboard).

**cURL**

```bash
curl -X POST https://brand-logos.vercel.app/api/extract \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_api_key" \
  -d '{"url": "https://stripe.com"}'
```

**TypeScript**

```typescript
const res = await fetch("https://brand-logos.vercel.app/api/extract", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer your_api_key",
  },
  body: JSON.stringify({ url: "https://stripe.com" }),
});
const brand = await res.json();
```

**Python**

```python
import requests

res = requests.post(
    "https://brand-logos.vercel.app/api/extract",
    headers={"Authorization": "Bearer your_api_key"},
    json={"url": "https://stripe.com"},
)
brand = res.json()
```

### As an npm package

> Coming soon — run Vibe as a library from your server-side code, no API key required.

```bash
npm add vibe-extract
```

```typescript
import { extractBrandAssets } from "vibe-extract";

const assets = await extractBrandAssets("https://stripe.com");
// assets.brand_name → "Stripe"
// assets.logos → LogoAsset[]
// assets.colors → ColorAsset[]
// assets.typography → TypographyAsset[]
// assets.backdrop_images → BackdropAsset[]
```

### As an MCP server

> Coming soon — use Vibe as a tool in Claude Code, Cursor, or any MCP-compatible client.

```bash
claude mcp add --transport stdio \
  --env VIBE_API_KEY=your_api_key \
  vibe -- npx -y vibe-mcp
```

Then ask Claude to "extract brand assets from stripe.com" and it will use the `extract_brand_assets` tool automatically.

### Self-host

```bash
git clone https://github.com/Uzbekswe/vibe.git
cd vibe
npm install
cp .env.example .env  # add your GitHub OAuth + database credentials
npx prisma db push
npm run dev
```

## API response

```json
{
  "brand_name": "Stripe",
  "logos": [
    { "url": "https://...", "type": "favicon" },
    { "url": "https://...", "type": "apple-touch-icon", "width": 180, "height": 180 },
    { "url": "https://...", "type": "og:image" }
  ],
  "colors": [
    { "hex": "#5838f8", "source": "dominant", "context": "logo" }
  ],
  "typography": [
    {
      "family": "Inter",
      "weights": [400, 600, 700],
      "sizes": ["16px", "24px", "48px"],
      "context": "heading",
      "source": "google-fonts"
    }
  ],
  "backdrop_images": [
    { "url": "https://...", "source": "og:image", "alt": "Open Graph image" },
    { "url": "https://...", "source": "hero", "alt": "" }
  ]
}
```

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Cheerio** — HTML parsing (no headless browser needed)
- **Sharp** — dominant color extraction from logo images
- **css-tree** — CSS parsing for typography extraction
- **Prisma** + Turso (LibSQL) — database for users and API keys
- **NextAuth.js** — GitHub OAuth authentication

## Vibe vs OpenBrand

| Feature | Vibe | OpenBrand |
|---------|------|-----------|
| Logos | Yes | Yes |
| Colors | Yes | Yes |
| Backdrop images | Yes | Yes |
| Brand name | Yes | Yes |
| **Typography** | **Yes** | No |
| API with keys | Yes | Yes |
| Self-hostable | Yes | Yes |
| npm package | Coming soon | Yes |
| MCP server | Coming soon | Yes |

## License

MIT
