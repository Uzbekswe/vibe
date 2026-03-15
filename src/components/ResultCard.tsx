"use client";

import { useState } from "react";
import type { BrandAssets } from "@/types/brand";
import { LogoGrid } from "./LogoGrid";
import { ColorSwatches } from "./ColorSwatches";
import { FontPreview } from "./FontPreview";

type ViewMode = "visual" | "json";

export function ResultCard({ assets }: { assets: BrandAssets }) {
  const [mode, setMode] = useState<ViewMode>("visual");
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(JSON.stringify(assets, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{assets.brand_name}</h2>
        <div className="flex">
          <button
            onClick={() => setMode("visual")}
            className={`px-4 py-1.5 text-sm font-medium rounded-l-lg border transition ${
              mode === "visual"
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Visual
          </button>
          <button
            onClick={() => setMode("json")}
            className={`px-4 py-1.5 text-sm font-medium rounded-r-lg border border-l-0 transition ${
              mode === "json"
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            JSON
          </button>
        </div>
      </div>

      {mode === "visual" ? (
        <div className="space-y-10">
          <LogoGrid logos={assets.logos} />
          <ColorSwatches colors={assets.colors} />

          {assets.backdrop_images.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
                Background Images
              </h3>
              <div className="space-y-4">
                {assets.backdrop_images.map((img) => (
                  <a
                    key={img.url}
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border rounded-lg overflow-hidden hover:shadow-md transition"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt ?? img.source}
                      className="w-full max-h-72 object-cover"
                      onError={(e) => {
                        const card = (e.target as HTMLImageElement).closest("a");
                        if (card) card.style.display = "none";
                      }}
                    />
                    <div className="px-3 py-2 text-sm text-gray-500">
                      {img.alt ?? img.source}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <FontPreview typography={assets.typography} />
        </div>
      ) : (
        <div className="relative rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={handleCopy}
            className="sticky top-3 float-right mr-3 mt-3 px-3 py-1 text-xs font-medium bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition z-10"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <pre className="bg-gray-900 text-gray-100 p-5 pt-2 overflow-auto max-h-[600px] text-sm leading-relaxed">
            {JSON.stringify(assets, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
