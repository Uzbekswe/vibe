# Vibe

Extract the vibe of any brand — logos, colors, typography, backdrop images, and brand name — from any website URL.

**Live demo:** [brand-logos.vercel.app](https://brand-logos.vercel.app)

## What it does

Give Vibe a URL, and it returns structured brand assets in seconds:

- **Logos** — favicons, apple-touch-icons, SVGs, and og:image logos
- **Brand colors** — from meta tags, manifest.json, and dominant color analysis of logo images
- **Typography** — font families, weights, sizes, and context (heading, body, navigation) parsed from linked CSS and Google Fonts
- **Backdrop images** — og:image, hero banners, and large background images
- **Brand name** — extracted from og:site_name, page title, or hostname

Typography extraction is a differentiator — most brand extraction tools skip it entirely.

## How to use it

### 1. Web interface

Go to [brand-logos.vercel.app](https://brand-logos.vercel.app), type a URL, and hit Extract. No login required.

### 2. API with key

Sign in with GitHub to create an API key, then call the API from anywhere:

```bash
curl -X POST https://brand-logos.vercel.app/api/extract \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"url": "https://stripe.com"}'
```

```python
import requests

res = requests.post(
    "https://brand-logos.vercel.app/api/extract",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={"url": "https://stripe.com"}
)
print(res.json())
```

```typescript
const res = await fetch("https://brand-logos.vercel.app/api/extract", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer YOUR_API_KEY",
  },
  body: JSON.stringify({ url: "https://stripe.com" }),
});
const data = await res.json();
```

### 3. Self-host

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
    { "url": "https://...", "type": "og:image" }
  ],
  "colors": [
    { "hex": "#5838f8", "source": "dominant", "context": "logo" }
  ],
  "backdrop_images": [
    { "url": "https://...", "source": "og:image", "alt": "..." }
  ],
  "typography": [
    {
      "family": "Inter",
      "weights": [400, 600, 700],
      "sizes": ["16px", "24px", "48px"],
      "context": "heading",
      "source": "google-fonts"
    }
  ]
}
```

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Cheerio** — HTML parsing (no headless browser)
- **Sharp** — dominant color extraction from logo images
- **css-tree** — CSS parsing for typography extraction
- **Prisma** + Turso (LibSQL) — database for users and API keys
- **NextAuth.js** — GitHub OAuth authentication

## License

MIT
