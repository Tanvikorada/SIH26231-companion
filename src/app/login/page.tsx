"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Landmark, Lock, UserCheck } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [operatorId, setOperatorId] = useState("NCB-OP-109");
  const [pin, setPin] = useState("123456");
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
        
        {/* Demo Notification */}
        <div className="bg-[#FF9933]/10 border-b border-[#FF9933]/20 px-5 py-3 flex items-start gap-2">
          <UserCheck size={16} className="text-[#FF9933] mt-0.5 shrink-0" />
          <p className="text-[11px] text-[#003366] font-medium leading-tight">
            <strong>Demo Mode:</strong> Credentials for <span className="font-mono">NCB-OP-109</span> have been pre-filled for demonstration purposes.
          </p>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label htmlFor="op" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Operator ID</label>
            <input id="op" autoComplete="username" required value={operatorId} onChange={(e) => setOperatorId(e.target.value)} className="w-full border border-gray-400 px-3 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] font-mono" placeholder="e.g. NCB-OP-109" />
          </div>
          <div>
            <label htmlFor="pin" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">PIN</label>
            <input id="pin" type="password" inputMode="numeric" autoComplete="current-password" required value={pin} onChange={(e) => setPin(e.target.value)} className="w-full border border-gray-400 px-3 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] font-mono tracking-widest" />
          </div>
          {error && <p role="alert" className="text-sm font-bold text-red-700 border border-red-300 bg-red-50 p-2">{error}</p>}
          <button disabled={busy} className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-3 text-sm flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9933] disabled:opacity-60 transition-colors">
            <Lock size={16} /> {busy ? "SIGNING IN..." : "SECURE SIGN IN"}
          </button>
          <p className="text-[11px] text-gray-500 text-center pt-2">Every test record is cryptographically signed and attributed to the signed-in operator.</p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-[#003366] text-sm font-bold">
        Loading Secure Terminal...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
