"use client";

export function SignOutButton() {
  const signOut = async () => {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };
  return (
    <button onClick={signOut} className="ml-4 border border-white/40 px-2 py-0.5 text-[11px] font-sans font-bold uppercase text-white hover:bg-[#002B55] focus:outline-none focus:ring-2 focus:ring-[#FF9933]">
      Sign out
    </button>
  );
}
