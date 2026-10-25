import { z } from "zod";

export const ParentSettingsSchema = z.object({
  interests: z.array(z.string().max(30)).max(10).default([]),
  session: z.object({
    adventureLength: z.number().int().min(2).max(5).default(4), // activities in Today's Adventure
    showDurations: z.boolean().default(true),
    neverRepeat: z.boolean().default(true), // a finished game is not offered again until a grown-up resets games
    gamesResetAt: z.record(z.string(), z.string()).default({}), // child profile id -> when games were last reset
    screenTime: z.object({
      enabled: z.boolean().default(false),
      playMinutes: z.number().int().min(5).max(180).default(20), // play time before the app rests
      lockHours: z.number().int().min(1).max(24).default(2), // how long the app rests afterwards
    }).prefault({}),
    gentleBreakReminderMinutes: z.number().int().min(5).max(60).nullable().default(null), // a kind "time for a stretch?" note; never blocks play
  }).prefault({}),
  audio: z.object({
    muted: z.boolean().default(false),
    volume: z.number().min(0).max(1).default(0.8),
    speakInstructions: z.boolean().default(true),
    soundEffects: z.boolean().default(true),
    voiceName: z.string().max(200).nullable().default(null), // null = friendliest voice found on this device
  }).prefault({}),
  speech: z.object({
    microphoneEnabled: z.boolean().default(false), // parent must opt in
  }).prefault({}),
  ai: z.object({
    enabled: z.boolean().default(false), // parent must opt in; also needs server configuration
    dailyReplyLimit: z.number().int().min(0).max(500).default(40),
  }).prefault({}),
  privacy: z.object({
    retentionDays: z.number().int().min(30).max(3650).default(730),
    // Transcripts are never stored. There is deliberately no switch for it.
  }).prefault({}),
  parentPin: z.object({ salt: z.string(), hash: z.string() }).nullable().default(null),
  statusOverrides: z.record(z.string(), z.object({
    status: z.enum(["draft", "validated", "published", "retired"]).optional(),
    reviewStatus: z.enum(["unreviewed", "reviewed"]).optional(),
  })).default({}),
});
export type ParentSettings = z.infer<typeof ParentSettingsSchema>;
export const defaultSettings = (): ParentSettings => ParentSettingsSchema.parse({});
