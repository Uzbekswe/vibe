"use client";

import { useState } from "react";
import type { LogoAsset } from "@/types/brand";

function LogoCard({ logo }: { logo: LogoAsset }) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <a
      href={logo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="border rounded-lg overflow-hidden hover:shadow-md transition"
    >
      <div
        className="w-24 h-24 flex items-center justify-center p-3"
        style={{
          backgroundImage:
            "linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)",
          backgroundSize: "16px 16px",
          backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo.url}
          alt={logo.type}
          className="max-h-16 max-w-full object-contain"
          onError={() => setFailed(true)}
        />
      </div>
      <div className="px-3 py-1.5 text-xs text-gray-500 text-center border-t">
        {logo.type}
      </div>
    </a>
  );
}

export function LogoGrid({ logos }: { logos: LogoAsset[] }) {
  if (logos.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
        Logos
      </h3>
      <div className="flex flex-wrap gap-4">
        {logos.map((logo) => (
          <LogoCard key={logo.url} logo={logo} />
        ))}
      </div>
    </div>
  );
}
