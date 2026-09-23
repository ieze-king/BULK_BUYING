"use client";

import { useEffect, useState } from "react";

function remaining(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "any moment";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `in ${h}h ${m}m` : `in ${m}m`;
}

/** Ticks locally so the window feels live rather than stale on a cached page. */
export function Countdown({ iso }: { iso: string }) {
  const [label, setLabel] = useState(() => remaining(iso));

  useEffect(() => {
    const id = setInterval(() => setLabel(remaining(iso)), 30000);
    return () => clearInterval(id);
  }, [iso]);

  return (
    <strong className="font-display font-black">
      {label}{" "}
      <span className="font-sans text-sm font-semibold opacity-70">
        ({new Date(iso).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })})
      </span>
    </strong>
  );
}
