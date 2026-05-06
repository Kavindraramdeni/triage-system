"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function ConfirmationView() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [mrn, setMrn] = useState("");

  useEffect(() => {
    const t = sessionStorage.getItem("triage_token");
    const m = sessionStorage.getItem("triage_mrn");
    if (!t) { router.push("/intake"); return; }
    setToken(t);
    setMrn(m ?? "");
  }, [router]);

  function copyToken() {
    navigator.clipboard.writeText(token);
  }

  return (
    <div className="space-y-4">
      {/* Success card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">You're checked in</h1>
        <p className="text-gray-500 text-sm">A triage nurse has been notified. Please take a seat and wait to be called.</p>
      </div>

      {/* Token card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-semibold text-gray-500 mb-1">Your queue reference</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 break-all">{token}</code>
          <button onClick={copyToken} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Copy">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
        {mrn && <p className="text-xs text-gray-400 mt-2">MRN: {mrn}</p>}
        <button
          onClick={() => router.push(`/status/${token}`)}
          className="mt-3 w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Track your queue position →
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">Important</h3>
        <ul className="space-y-1.5 text-sm text-amber-700">
          <li className="flex gap-2"><span>•</span>If your condition worsens, tell the front desk immediately.</li>
          <li className="flex gap-2"><span>•</span>Do not leave without informing staff — your slot will be lost.</li>
          <li className="flex gap-2"><span>•</span>Keep your reference code safe to check your status.</li>
        </ul>
      </div>
    </div>
  );
}
