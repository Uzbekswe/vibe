"use client";

import { useState } from "react";

type Tab = "api" | "self-hosting" | "mcp";

const tabs: { key: Tab; label: string }[] = [
  { key: "api", label: "With API Key" },
  { key: "self-hosting", label: "Self Hosting" },
  { key: "mcp", label: "MCP" },
];

interface GetStartedProps {
  searchedUrl?: string;
  brandName?: string;
}

export function GetStarted({ searchedUrl, brandName }: GetStartedProps) {
  const [tab, setTab] = useState<Tab>("api");
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://your-domain.com";
  const exampleUrl = searchedUrl
    ? (searchedUrl.startsWith("http") ? searchedUrl : `https://${searchedUrl}`)
    : "https://stripe.com";
  const exampleName = brandName || "Stripe";

  return (
    <div className="mt-16 mb-8">
      <h2 className="text-2xl font-bold mb-4">Get Started</h2>

      <div className="inline-flex bg-gray-100 rounded-lg p-1 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              tab === t.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "api" && (
        <div className="space-y-4">
          <p className="text-gray-600">
            Use the Vibe API to extract brand assets programmatically.
          </p>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm leading-relaxed">
{`curl -X POST ${baseUrl}/api/extract \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"url": "${exampleUrl}"}'`}
          </pre>
          <p className="text-gray-500 text-sm mt-2">
            Sign in with GitHub to create and manage your API keys.
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Sign in to get API Keys
          </a>
        </div>
      )}

      {tab === "self-hosting" && (
        <div className="space-y-4">
          <p className="text-gray-600">
            Install the npm package:
          </p>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm leading-relaxed">
{`npm add vibe`}
          </pre>
          <p className="text-gray-400 text-sm">
            No API key required. Runs as a library from your server-side code.
          </p>
          <p className="text-gray-600 mt-6">
            Extract brand assets from any URL:
          </p>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm leading-relaxed">
{`import { extractBrandAssets } from "vibe";

const result = await extractBrandAssets("${exampleUrl}");
if (result.ok) {
  // result.data.brand_name → "${exampleName}"
  // result.data.logos → LogoAsset[]
  // result.data.colors → ColorAsset[]
  // result.data.backdrop_images → BackdropAsset[]
  // result.data.typography → TypographyAsset[]
}`}
          </pre>
        </div>
      )}

      {tab === "mcp" && (
        <div className="space-y-4">
          <p className="text-gray-600">
            Use Vibe as an MCP server in Claude Code, Cursor, or any MCP-compatible client.
          </p>

          <p className="text-gray-500 text-sm mt-4">
            1. Install the MCP server:
          </p>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm leading-relaxed">
{`claude mcp add vibe -- npx -y vibe-mcp`}
          </pre>

          <p className="text-gray-500 text-sm mt-4">
            2.{" "}
            <a href="/login" className="underline text-gray-700 hover:text-gray-900">
              Get your API key
            </a>{" "}
            from the dashboard and add it:
          </p>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm leading-relaxed">
{`claude mcp add \\
  --env VIBE_API_KEY=your_api_key \\
  vibe -- npx -y vibe-mcp`}
          </pre>

          <p className="text-gray-500 text-sm mt-4">
            Or add to your{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">.claude/settings.json</code>
            {" "}:
          </p>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm leading-relaxed">
{`{
  "mcpServers": {
    "vibe": {
      "command": "npx",
      "args": ["-y", "vibe-mcp"],
      "env": {
        "VIBE_API_KEY": "your_api_key"
      }
    }
  }
}`}
          </pre>

          <p className="text-gray-400 text-sm mt-2">
            Then ask Claude to &quot;extract brand assets from {exampleUrl.replace("https://", "")}&quot; and it will use the tool automatically.
          </p>
        </div>
      )}
    </div>
  );
}
