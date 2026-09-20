"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Landmark, Lock } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [operatorId, setOperatorId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/v1/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ operator_id: operatorId, pin }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Sign-in failed");
      const next = params.get("next");
      router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
    } catch (err: any) {
      setError(err.message || "Sign-in failed");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-gray-300 shadow-sm">
        <div className="bg-[#003366] text-white p-4 flex items-center gap-3">
          <Landmark size={28} />
          <div>
            <h1 className="text-sm font-bold uppercase tracking-wide">Narcotics Control Bureau</h1>
            <h2 className="text-[11px] text-gray-300">Field Drug Test Companion - Operator Sign-in</h2>
          </div>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label htmlFor="op" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Operator ID</label>
            <input id="op" autoComplete="username" required value={operatorId} onChange={(e) => setOperatorId(e.target.value)} className="w-full border border-gray-400 px-3 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]" placeholder="e.g. NCB-OP-109" />
          </div>
          <div>
            <label htmlFor="pin" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">PIN</label>
            <input id="pin" type="password" inputMode="numeric" autoComplete="current-password" required value={pin} onChange={(e) => setPin(e.target.value)} className="w-full border border-gray-400 px-3 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]" />
          </div>
          {error && <p role="alert" className="text-sm font-bold text-red-700 border border-red-300 bg-red-50 p-2">{error}</p>}
          <button disabled={busy} className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-3 text-sm flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9933] disabled:opacity-60">
            <Lock size={16} /> {busy ? "SIGNING IN..." : "SIGN IN"}
          </button>
          <p className="text-[11px] text-gray-600">Every test record is attributed to the signed-in operator and digitally signed on the server.</p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
