"use client";

import { useState } from "react";

type Tab = "api" | "self-hosting" | "npm";

const tabs: { key: Tab; label: string }[] = [
  { key: "api", label: "With API" },
  { key: "self-hosting", label: "Self Hosting" },
  { key: "npm", label: "NPM" },
];

export function GetStarted() {
  const [tab, setTab] = useState<Tab>("api");

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
{`curl -X POST http://localhost:3000/api/extract \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://stripe.com"}'`}
          </pre>
        </div>
      )}

      {tab === "self-hosting" && (
        <div className="space-y-4">
          <p className="text-gray-600">
            Clone and run Vibe locally.
          </p>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm leading-relaxed">
{`git clone <your-repo-url>
cd brand-logos
npm install
npm run dev`}
          </pre>
        </div>
      )}

      {tab === "npm" && (
        <div className="space-y-4">
          <p className="text-gray-600">
            Use the extractor directly in your Node.js project.
          </p>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm leading-relaxed">
{`import { extractBrandAssets } from "./lib/extractor";

const assets = await extractBrandAssets("https://stripe.com");
console.log(assets.brand_name);
console.log(assets.typography); // fonts, weights, sizes`}
          </pre>
        </div>
      )}
    </div>
  );
}
