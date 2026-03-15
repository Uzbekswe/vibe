"use client";

import { useState } from "react";
import type { BrandAssets } from "@/types/brand";
import { ResultCard } from "@/components/ResultCard";
import { GetStarted } from "@/components/GetStarted";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assets, setAssets] = useState<BrandAssets | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setAssets(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Extraction failed");
        return;
      }

      setAssets(data);
    } catch {
      setError("Network error — check the URL and try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-2">Vibe</h1>
        <p className="text-gray-500">
          Extract the vibe of any brand — logos, colors, images &amp; typography
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter a website URL (e.g. stripe.com, github.com)"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-black disabled:opacity-50 transition font-medium"
        >
          {loading ? "Extracting..." : "Extract"}
        </button>
      </form>

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {assets && <ResultCard assets={assets} />}

      <GetStarted searchedUrl={assets ? url.trim() : undefined} brandName={assets?.brand_name} />
    </main>
  );
}
