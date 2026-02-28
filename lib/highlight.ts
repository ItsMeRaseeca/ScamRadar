const NEUTRAL_TOKENS = new Set<string>([
  'line',
  'direction',
  'alignment',
  'team',
  'role',
  'work',
  'per',
  'day',
  'year',
  'month',
  'apply',
  'business',
  'development',
  'experience',
  'management',
  'marketing',
  'sales',
  'position',
  'industry',
  'client',
]);

const SCAM_SIGNAL = [
  'earn quickly',
  'weekly payment',
  'guaranteed income',
  'no experience required',
  'immediate hiring',
  'apply now',
  'work from home high pay',
  'limited time offer',
  'registration fee',
  'processing fee',
  'investment required',
  'whatsapp only',
];

/**
 * Extract keywords for highlighting:
 * - Explicit ML tokens from the structured ML explanation sentence
 * - Plus any scam-signal lexicon phrases that actually appear in the text.
 * Corporate-neutral words are never highlighted.
 */
export function extractKeywords(reasoning: string[], originalText?: string): string[] {
  const keywords: Set<string> = new Set();

  reasoning.forEach((reason) => {
    // We now expect patterns like:
    // "Statistical pattern analysis detected historically correlated risk signals: token1, token2"
    const colonMatch = reason.match(/:\s*([^\.]+)/);
    if (!colonMatch) return;

    const words = colonMatch[1]
      .split(',')
      .map((w) => w.trim().toLowerCase())
      .filter(
        (w) =>
          w.length > 3 &&
          !NEUTRAL_TOKENS.has(w) &&
          !/^\d+$/.test(w.replace(/\s+/g, '')),
      );

    words.forEach((word) => keywords.add(word));
  });

  // Add scam-signal lexicon phrases that are actually present in the original text
  if (originalText) {
    const lowerText = originalText.toLowerCase();
    SCAM_SIGNAL.forEach((phrase) => {
      const p = phrase.toLowerCase();
      if (lowerText.includes(p)) {
        keywords.add(p);
      }
    });
  }

  return Array.from(keywords);
}

export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

/**
 * Highlight keywords in text by marking matching segments.
 * Rendering (JSX) is handled in the React components to keep this file JSX-free.
 */
export function highlightText(text: string, keywords: string[]): HighlightSegment[] {
  if (!text || keywords.length === 0) {
    return [{ text, highlighted: false }];
  }

  // Sort keywords by length (longest first) to avoid partial matches
  const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);

  // Create a regex pattern that matches any keyword as a whole word (case-insensitive)
  const pattern = new RegExp(
    `\\b(${sortedKeywords
      .map((kw) => kw.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'))
      .join('|')})\\b`,
    'gi'
  );

  const segments: HighlightSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex lastIndex
  pattern.lastIndex = 0;

  while ((match = pattern.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, match.index),
        highlighted: false,
      });
    }

    // Add highlighted match
    segments.push({
      text: match[0],
      highlighted: true,
    });

    lastIndex = pattern.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      highlighted: false,
    });
  }

  return segments.length > 0 ? segments : [{ text, highlighted: false }];
}

