"use client";

import type { TypographyAsset } from "@/types/brand";

function googleFontsImportUrl(family: string): string {
  const formatted = family.replace(/ /g, "+");
  return `https://fonts.googleapis.com/css2?family=${formatted}&display=swap`;
}

function contextLabel(font: TypographyAsset): string {
  if (font.context === "other" && font.weights.length === 0 && font.sizes.length === 0) {
    return "brand";
  }
  return font.context;
}

export function FontPreview({ typography }: { typography: TypographyAsset[] }) {
  if (typography.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
        Typography
      </h3>
      <div className="space-y-4">
        {typography.map((font) => (
          <div key={font.family + font.context} className="border rounded-lg p-4">
            {/* eslint-disable-next-line @next/next/no-css-tags */}
            <link rel="stylesheet" href={googleFontsImportUrl(font.family)} />
            <div className="flex items-baseline justify-between mb-2">
              <h4 className="font-medium" style={{ fontFamily: `"${font.family}"` }}>
                {font.family}
              </h4>
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                {contextLabel(font)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">
              Source: {font.source}
            </p>
            {font.weights.length > 0 && (
              <p className="text-sm text-gray-500 mb-1">
                Weights: {font.weights.join(", ")}
              </p>
            )}
            {font.sizes.length > 0 && (
              <p className="text-sm text-gray-500">
                Sizes: {font.sizes.join(", ")}
              </p>
            )}
            <p
              className="mt-3 text-lg text-gray-800"
              style={{ fontFamily: `"${font.family}"` }}
            >
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
