import { z } from "zod";

export const AGE_BANDS = ["little-explorer", "curious-thinker", "confident-learner", "young-problem-solver"] as const;
export const AgeBandSchema = z.enum(AGE_BANDS);
export type AgeBand = z.infer<typeof AgeBandSchema>;

export const AGE_BAND_INFO: Record<AgeBand, { label: string; ages: string; order: number }> = {
  "little-explorer": { label: "Little Explorer", ages: "3–4", order: 0 },
  "curious-thinker": { label: "Curious Thinker", ages: "4–5", order: 1 },
  "confident-learner": { label: "Confident Learner", ages: "5–6", order: 2 },
  "young-problem-solver": { label: "Young Problem Solver", ages: "6–7", order: 3 },
};

export const WORLD_SLUGS = ["number-kingdom", "conversation-cafe", "puzzle-planet", "wonder-world", "creativity-forest"] as const;
export const WorldSlugSchema = z.enum(WORLD_SLUGS);
export type WorldSlug = z.infer<typeof WorldSlugSchema>;

export const DOMAIN_SLUGS = [
  "mathematics",
  "spoken-english",
  "conversation",
  "logic-puzzles",
  "early-literacy",
  "science-knowledge",
  "creativity-storytelling",
  "social-emotional",
] as const;
export const DomainSlugSchema = z.enum(DOMAIN_SLUGS);
export type DomainSlug = z.infer<typeof DomainSlugSchema>;

export const PublicationStatusSchema = z.enum(["draft", "validated", "published", "retired"]);
export type PublicationStatus = z.infer<typeof PublicationStatusSchema>;

export const ReviewStatusSchema = z.enum(["unreviewed", "reviewed"]);
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;

export const DomainSchema = z.object({
  id: DomainSlugSchema, // slug doubles as stable id
  name: z.string().min(1),
  slug: DomainSlugSchema,
  description: z.string().min(1),
  displayOrder: z.number().int(),
  progression: z.array(z.string().min(1)).min(3), // progression model, earliest first
});
export type Domain = z.infer<typeof DomainSchema>;

export const FrameworkSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  issuingOrganisation: z.string().min(1),
  officialSourceUrl: z.string().url(),
  ageRange: z.string().min(1),
  learningDomains: z.array(z.string()).min(1),
  learningPrinciples: z.array(z.string()),
  reviewDate: z.string().nullable(), // ISO date, or null when NOT actually consulted
  verificationStatus: z.enum(["pending", "verified"]),
  notes: z.string().min(1),
  appUse: z.string().min(1), // how it informs the application
});
export type Framework = z.infer<typeof FrameworkSchema>;

export const FrameworkMappingSchema = z.object({
  frameworkId: z.string().min(1),
  reference: z.string().min(1), // learning-area level, never an invented clause number
  mappingType: z.enum(["aligns", "partial", "informs"]),
});

export const ObjectiveSchema = z.object({
  id: z.string().regex(/^[A-Z]{2,4}-[A-Z0-9]+-\d{2}$/, "objective id like MATH-CNT-01"),
  domain: DomainSlugSchema,
  subdomain: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  ageBand: AgeBandSchema,
  prerequisites: z.array(z.string()),
  priorKnowledge: z.string().min(1),
  examples: z.array(z.string().min(1)).min(1),
  activityTypes: z.array(z.string().min(1)).min(1),
  successCriteria: z.array(z.string().min(1)).min(1),
  commonDifficulties: z.array(z.string().min(1)).min(1),
  hints: z.array(z.string().min(1)).min(1),
  nextSteps: z.array(z.string()),
  frameworkMappings: z.array(FrameworkMappingSchema).min(1),
  parentExplanation: z.string().min(1),
  offlineIdea: z.string().optional(),
  status: PublicationStatusSchema,
});
export type Objective = z.infer<typeof ObjectiveSchema>;

export const ageBandIndex = (b: AgeBand) => AGE_BAND_INFO[b].order;
