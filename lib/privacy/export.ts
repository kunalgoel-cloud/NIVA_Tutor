import type { AppData } from "@/lib/database/types";

export const EXPORT_FORMAT = "little-wonder-world-export/1";

/** Everything stored about one child, as a readable JSON-able object. Never includes the parent PIN hash. */
export function buildExport(d: AppData, profileId: string, now = new Date()) {
  const profile = d.profiles.find((p) => p.id === profileId);
  if (!profile) return null;
  const { parentPin: _pin, ...settings } = d.settings; // eslint-disable-line @typescript-eslint/no-unused-vars
  return {
    format: EXPORT_FORMAT,
    exportedAt: now.toISOString(),
    note: "Local-device data. Speech recordings and conversation transcripts are never stored by this app.",
    profile,
    settings: { ...settings, parentPinSet: !!d.settings.parentPin },
    attempts: d.attempts.filter((a) => a.childProfileId === profileId),
  };
}
