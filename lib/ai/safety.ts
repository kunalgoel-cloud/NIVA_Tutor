// Input redaction and output screening for child conversations.
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/g;
const URL_RE = /(https?:\/\/|www\.)\S+/gi;
const LONG_NUMBER = /\b\d[\d\s-]{6,}\d\b/g;

/** Remove things that look like contact details before anything leaves the device. */
export function redactChildInput(text: string): string {
  return text.replace(EMAIL, "[removed]").replace(URL_RE, "[removed]").replace(LONG_NUMBER, "[removed]").slice(0, 200).trim();
}

const BLOCKED_OUTPUT: RegExp[] = [
  /https?:\/\//i, /www\./i, /\b\S+@\S+\.\S+\b/,
  /\b(what('| i)?s|tell me|say) your (full )?(last )?name\b/i, /\bwhere do you live\b/i, /\b(your|home) address\b/i, /\bwhat school\b/i, /\bphone number\b/i,
  /\bour (little )?secret\b/i, /\bdon'?t tell (your )?(mum|mom|dad|parents|anyone|grown)/i, /\bkeep (it|this) (a )?secret\b/i,
  /\bi('m| am) (a )?(real )?(child|kid|boy|girl|human|person)\b/i, /\bi('m| am) your (best )?friend forever\b/i,
  /\b(stupid|dumb|idiot|hate you|you failed|you're bad|you are bad)\b/i, /\bi('m| am) (sad|angry|disappointed) (that|because) you\b/i,
  /\b(kill|gun|knife|sex|drugs?|beer|wine)\b/i,
];

export function isOutputSafe(text: string): boolean {
  return !BLOCKED_OUTPUT.some((re) => re.test(text));
}

/** Count of question marks: character must ask at most one question at a time. */
export const questionCount = (t: string) => (t.match(/\?/g) ?? []).length;
