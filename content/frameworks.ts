import type { Framework } from "@/lib/curriculum/schema";

/**
 * CURRICULUM-SOURCE REGISTER
 *
 * IMPORTANT HONESTY NOTE: when this register was written, the build environment had no access to the
 * public internet (DNS lookups failed), so NONE of these sources were actually opened or read.
 * Every entry is therefore `verificationStatus: "pending"` with `reviewDate: null`.
 * The URLs are the publishers' well-known addresses recalled from memory and must be checked by a
 * human. Learning areas listed are the author's general understanding, not quotations.
 * Objective mappings are deliberately kept at "learning area" level and never cite clause numbers.
 */
export const FRAMEWORKS: Framework[] = [
  {
    id: "ncf-fs", name: "National Curriculum Framework for the Foundational Stage (NCF-FS)",
    issuingOrganisation: "NCERT, Government of India (under NEP 2020)", officialSourceUrl: "https://ncert.nic.in",
    ageRange: "3–8 years (foundational stage)",
    learningDomains: ["Physical development", "Socio-emotional and ethical development", "Cognitive development", "Language and literacy", "Aesthetic and cultural development", "Positive learning habits"],
    learningPrinciples: ["Play-based, activity-based learning", "Mother-tongue / home-language richness", "Holistic development"],
    reviewDate: null, verificationStatus: "pending",
    notes: "Not consulted in this environment. Primary reference for the India context. Verify exact domain names and learning-goal wording against the official PDF before relying on them.",
    appUse: "Informs the play-first approach, the balance of language/maths/socio-emotional domains, and India/world-culture content in Wonder World.",
  },
  {
    id: "eyfs", name: "Early Years Foundation Stage (EYFS) statutory framework",
    issuingOrganisation: "Department for Education, UK Government", officialSourceUrl: "https://www.gov.uk/government/publications/early-years-foundation-stage-framework--2",
    ageRange: "Birth to 5 years",
    learningDomains: ["Communication and language", "Personal, social and emotional development", "Physical development", "Literacy", "Mathematics", "Understanding the world", "Expressive arts and design"],
    learningPrinciples: ["Unique child", "Positive relationships", "Enabling environments", "Learning and development through play and exploration"],
    reviewDate: null, verificationStatus: "pending",
    notes: "Not consulted in this environment. Domain list recalled from general knowledge; verify before citing.",
    appUse: "Shapes the language-rich 'Conversation Café', early-maths progression and the emphasis on adult-child interaction and offline extension.",
  },
  {
    id: "nel", name: "Nurturing Early Learners (NEL) Framework",
    issuingOrganisation: "Ministry of Education, Singapore", officialSourceUrl: "https://www.moe.gov.sg/preschool/nel-framework",
    ageRange: "4–6 years (kindergarten)",
    learningDomains: ["Aesthetics and creative expression", "Discovery of the world", "Language and literacy", "Motor skills development", "Numeracy", "Social and emotional development"],
    learningPrinciples: ["Learning through purposeful play", "Learning dispositions", "Teacher-child interaction"],
    reviewDate: null, verificationStatus: "pending",
    notes: "Not consulted in this environment. Age range starts later than our 3–4 band, so mappings for Little Explorer are indicative only.",
    appUse: "Informs 'Discovery of the world' style science activities and learning dispositions such as curiosity and perseverance.",
  },
  {
    id: "elof", name: "Head Start Early Learning Outcomes Framework (ELOF)",
    issuingOrganisation: "Office of Head Start, US Department of Health and Human Services", officialSourceUrl: "https://eclkc.ohs.acf.hhs.gov/school-readiness/early-learning-outcomes-framework-elof",
    ageRange: "Birth to 5 years",
    learningDomains: ["Approaches to learning", "Social and emotional development", "Language and literacy", "Cognition (maths and science)", "Perceptual, motor and physical development"],
    learningPrinciples: ["Developmental progressions", "Individual differences", "Cultural and linguistic responsiveness"],
    reviewDate: null, verificationStatus: "pending",
    notes: "Not consulted in this environment. Its developmental-progression style informed our objective ladders; verify the domain names before citing.",
    appUse: "Informs the idea of progressions within a domain and the evidence-based (not age-deadline) approach.",
  },
  {
    id: "montessori", name: "Montessori principles (concrete to abstract)",
    issuingOrganisation: "American Montessori Society / Association Montessori Internationale (pedagogical tradition)", officialSourceUrl: "https://amshq.org",
    ageRange: "3–6 years (primary / casa)",
    learningDomains: ["Practical life", "Sensorial", "Mathematics", "Language", "Cultural studies"],
    learningPrinciples: ["Concrete before abstract", "Isolation of one difficulty", "Self-correction and control of error", "Child-led choice"],
    reviewDate: null, verificationStatus: "pending",
    notes: "A pedagogical tradition rather than a government framework; not consulted here. Used as a design principle only.",
    appUse: "Maths progression from physical to visual to numeral to abstract; one idea at a time per activity; gentle self-correction through hints.",
  },
  {
    id: "reggio", name: "Reggio Emilia approach (exploration and creativity)",
    issuingOrganisation: "Reggio Children / municipal preschools of Reggio Emilia, Italy", officialSourceUrl: "https://www.reggiochildren.it/en/",
    ageRange: "0–6 years",
    learningDomains: ["Expressive languages ('the hundred languages')", "Documentation of learning", "Collaboration"],
    learningPrinciples: ["Child as capable explorer", "Environment as third teacher", "Many ways of expressing ideas"],
    reviewDate: null, verificationStatus: "pending",
    notes: "A pedagogical tradition; not consulted here. Used as a design principle only.",
    appUse: "Open-ended Creativity Forest tasks with no single right answer; encouraging the child to explain thinking.",
  },
  {
    id: "evidence", name: "Evidence-informed early learning principles (e.g. Nurturing Care Framework)",
    issuingOrganisation: "WHO / UNICEF / World Bank (Nurturing Care Framework)", officialSourceUrl: "https://nurturing-care.org",
    ageRange: "Early childhood",
    learningDomains: ["Responsive caregiving", "Early learning opportunities", "Safety and security", "Health", "Nutrition"],
    learningPrinciples: ["Responsive interaction with adults", "Play and conversation drive learning", "Spaced practice and retrieval", "Limit passive screen time"],
    reviewDate: null, verificationStatus: "pending",
    notes: "Not consulted here. Spaced review and 'adult conversation beats screen time' are widely held principles; specific research citations still need to be gathered.",
    appUse: "Short sessions, spaced revisiting of objectives, offline parent-child activities, no streaks or pressure.",
  },
];
export const frameworkById = (id: string) => FRAMEWORKS.find((f) => f.id === id);
