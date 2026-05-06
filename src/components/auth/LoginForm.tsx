"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)} required
          className="w-full px-3 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 text-sm focus:border-blue-500 outline-none"
          placeholder="you@hospital.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
        <input
          type="password" value={password} onChange={e => setPassword(e.target.value)} required
          className="w-full px-3 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 text-sm focus:border-blue-500 outline-none"
          placeholder="••••••••"
        />
      </div>
      {error && <div className="rounded-lg bg-red-900/50 border border-red-700 px-3 py-2 text-sm text-red-300">{error}</div>}
      <button type="submit" disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors">
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
