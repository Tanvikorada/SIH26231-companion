import React from "react";

export function StampBadge({ status }: { status: "positive" | "negative" | "inconclusive" }) {
  let colorClass = "text-[var(--color-navy)] border-[var(--color-navy)]";
  
  if (status === "positive") {
    colorClass = "text-red-700 border-red-700";
  } else if (status === "negative") {
    colorClass = "text-green-700 border-green-700";
  } else {
    colorClass = "text-[var(--color-brass)] border-[var(--color-brass)]";
  }

  return (
    <div className={`inline-block border-4 p-4 uppercase font-bold text-3xl tracking-widest ${colorClass} rotate-[-5deg] opacity-90 font-mono`}>
      {status}
    </div>
  );
}
