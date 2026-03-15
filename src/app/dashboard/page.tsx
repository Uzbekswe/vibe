"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";

type Tab = "curl" | "python" | "typescript";
const tabs: { key: Tab; label: string }[] = [
  { key: "curl", label: "cURL" },
  { key: "python", label: "Python" },
  { key: "typescript", label: "TypeScript" },
];

interface ApiKeyEntry {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsed: string | null;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [keys, setKeys] = useState<ApiKeyEntry[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<Tab>("curl");
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://your-domain.com";

  const fetchKeys = useCallback(async () => {
    const res = await fetch("/api/keys");
    if (res.ok) setKeys(await res.json());
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const [error, setError] = useState<string | null>(null);

  async function createKey() {
    if (!newKeyName.trim()) return;
    setError(null);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create key");
        return;
      }
      setCreatedKey(data.key);
      setNewKeyName("");
      fetchKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    }
  }

  async function revokeKey(id: string) {
    try {
      const res = await fetch("/api/keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to revoke key");
        return;
      }
      fetchKeys();
    } catch {
      setError("Network error");
    }
  }

  function copyKey() {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold">
            Vibe
          </a>
          <div className="flex items-center gap-4">
            {session?.user?.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt=""
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-sm text-gray-600">{session?.user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        {/* Create key */}
        <section>
          <h2 className="text-xl font-bold mb-4">Create API Key</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Key name (e.g. my-app)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createKey()}
              className="flex-1 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              onClick={createKey}
              className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition"
            >
              Create
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </section>

        {/* Newly created key */}
        {createdKey && (
          <section className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-800 mb-2">
              Your API key (copy it now — it won&apos;t be shown again):
            </p>
            <div className="flex items-center gap-3">
              <code className="flex-1 text-sm bg-white px-3 py-2 rounded border font-mono break-all">
                {createdKey}
              </code>
              <button
                onClick={copyKey}
                className="px-3 py-2 text-sm bg-green-700 text-white rounded hover:bg-green-800 transition"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </section>
        )}

        {/* Existing keys */}
        <section>
          <h2 className="text-xl font-bold mb-4">Your API Keys</h2>
          {keys.length === 0 ? (
            <p className="text-gray-500 text-sm">No API keys yet.</p>
          ) : (
            <div className="space-y-3">
              {keys.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center justify-between bg-white border rounded-lg px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-sm">{k.name}</p>
                    <p className="text-xs text-gray-400 font-mono">
                      {k.keyPrefix}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-xs text-gray-400">
                      <p>
                        Created{" "}
                        {new Date(k.createdAt).toLocaleDateString()}
                      </p>
                      {k.lastUsed && (
                        <p>
                          Last used{" "}
                          {new Date(k.lastUsed).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => revokeKey(k.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Usage examples */}
        <section>
          <h2 className="text-xl font-bold mb-4">Usage</h2>
          <div className="inline-flex bg-gray-100 rounded-lg p-1 mb-4">
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

          {tab === "curl" && (
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm leading-relaxed">
{`curl -X POST ${baseUrl}/api/extract \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"url": "https://stripe.com"}'`}
            </pre>
          )}

          {tab === "python" && (
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm leading-relaxed">
{`import requests

res = requests.post(
    "${baseUrl}/api/extract",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={"url": "https://stripe.com"}
)
print(res.json())`}
            </pre>
          )}

          {tab === "typescript" && (
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm leading-relaxed">
{`const res = await fetch("${baseUrl}/api/extract", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY",
  },
  body: JSON.stringify({ url: "https://stripe.com" }),
});
const data = await res.json();`}
            </pre>
          )}
        </section>
      </main>
    </div>
  );
}
