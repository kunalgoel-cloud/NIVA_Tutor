// Run with: npm run validate:content
import fs from "node:fs";
import path from "node:path";
import { RAW_ACTIVITIES, OBJECTIVES, FRAMEWORKS, DOMAINS } from "../content";
import { validateContent, hasErrors } from "../lib/validation/content-validator";

const pub = path.join(process.cwd(), "public");
const issues = validateContent({
  rawActivities: RAW_ACTIVITIES, objectives: OBJECTIVES, frameworks: FRAMEWORKS, domains: DOMAINS,
  mediaExists: (src) => fs.existsSync(path.join(pub, src)),
});

const errors = issues.filter((i) => i.level === "error");
const warnings = issues.filter((i) => i.level === "warning");
for (const i of errors) console.error(`ERROR   ${i.scope}: ${i.message}`);
for (const i of warnings) console.warn(`warning ${i.scope}: ${i.message}`);
console.log(`\n${RAW_ACTIVITIES.length} activities, ${OBJECTIVES.length} objectives, ${FRAMEWORKS.length} frameworks, ${DOMAINS.length} domains checked.`);
console.log(`${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(hasErrors(issues) ? 1 : 0);
