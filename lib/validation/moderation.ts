/**
 * Basis-Moderation gegen offensichtlichen Unfug.
 * Bewusst simpel (kein Ersatz für echte Moderation/AI), aber ein wirksamer
 * Deterrent gegen die gröbsten Fälle.
 */

// Klare Beleidigungen/Slurs (DE + EN). Wortgrenzen-Match → wenig False-Positives.
const BAD_WORDS = [
  // EN
  'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'bastard',
  'nigger', 'faggot', 'retard', 'whore', 'slut',
  // DE
  'arschloch', 'fotze', 'hurensohn', 'wichser', 'schlampe', 'nutte',
  'missgeburt', 'spast', 'hure', 'fick', 'scheisse', 'schwuchtel',
];

const profanityRegex = new RegExp(`\\b(${BAD_WORDS.join('|')})\\b`, 'i');

/** True, wenn der Text klar unangemessene Sprache enthält. */
export function containsProfanity(text: string): boolean {
  return profanityRegex.test(text.toLowerCase());
}

/**
 * Erlaubte Bild-Hosts für Avatar/Banner. Verhindert das Einbetten beliebiger
 * (ggf. unangemessener/unsicherer) Bilder von Fremd-Hosts. Der Avatar-Picker
 * nutzt DiceBear; eigene URLs müssen aus einer bekannten Quelle stammen.
 */
const ALLOWED_IMAGE_HOSTS = [
  'api.dicebear.com',
  'image.tmdb.org',
  'phrpjjuhwvanqfzcfxxg.supabase.co',
  'gravatar.com',
  'www.gravatar.com',
  'avatars.githubusercontent.com',
];

export function isAllowedImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && ALLOWED_IMAGE_HOSTS.includes(u.hostname);
  } catch {
    return false;
  }
}
