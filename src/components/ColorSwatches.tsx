"use client";

import type { ColorAsset } from "@/types/brand";

export function ColorSwatches({ colors }: { colors: ColorAsset[] }) {
  if (colors.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
        Colors
      </h3>
      <div className="flex flex-wrap gap-5">
        {colors.map((color) => (
          <button
            key={color.hex + color.source}
            onClick={() => navigator.clipboard.writeText(color.hex)}
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
            title="Click to copy"
          >
            <div
              className="w-16 h-16 rounded-xl border border-gray-200 shadow-sm group-hover:shadow-md transition"
              style={{ backgroundColor: color.hex }}
            />
            <span className="text-sm font-mono text-gray-700">{color.hex}</span>
            <span className="text-xs text-gray-400">{color.source}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
