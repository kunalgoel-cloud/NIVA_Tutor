"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";

/** Child pages need a selected profile. While loading, show a gentle placeholder (never a blank screen). */
export function RequireProfile({ children }: { children: React.ReactNode }) {
  const { ready, profile } = useApp();
  const router = useRouter();
  useEffect(() => { if (ready && !profile) router.replace("/"); }, [ready, profile, router]);
  if (!ready || !profile) return <div role="status" className="grid min-h-dvh place-items-center text-2xl font-bold text-ink-soft">Getting ready… ✨</div>;
  return <>{children}</>;
}
