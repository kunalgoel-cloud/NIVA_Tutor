"use client";
import { useEffect, useState } from "react";

/** Shown when the network drops. The core games work offline, so the message is reassuring, not alarming. */
export function OfflineBanner() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);
  if (online) return null;
  return (
    <div role="status" className="bg-sun px-4 py-2 text-center text-sm font-semibold text-ink">
      You are offline. The games still work! Chatting with AI is paused until the internet is back.
    </div>
  );
}
