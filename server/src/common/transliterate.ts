// Best-effort Roman -> Devanagari phonetic transliteration for the
// "Name in Hindi" field on the Supplier Master.
//
// This is NOT a dictionary-backed translator — it's a small greedy
// consonant/vowel tokenizer that maps romanized syllables to their
// Devanagari equivalents. Good enough for common Indian given names
// (Ramesh -> रमेश, Suresh -> सुरेश, Amit -> अमित, Chandra -> चन्द्र);
// it will get unusual spellings or English loanwords wrong, and it can't
// tell short from long vowels when the Roman spelling doesn't
// (plain "a" is always treated as short — write "raaj" for राज, not "raj").
//
// Rejected alternative: a third-party npm transliteration package. The
// only close match on the registry (`sanscript`) sits at v0.0.2 with no
// real adoption — not something worth depending on for a resume project.
// Hand-rolling keeps behaviour transparent, free, and is a better
// interview talking point than an unvetted dependency.

const DEVANAGARI_RANGE = /[ऀ-ॿ]/;
const ENGLISH_LETTERS_ONLY = /^[a-zA-Z\s.'-]+$/;

const VOWEL_DIGRAPHS: Array<[string, string, string]> = [
  ['aa', 'आ', 'ा'],
  ['ee', 'ई', 'ी'],
  ['oo', 'ऊ', 'ू'],
  ['ai', 'ऐ', 'ै'],
  ['au', 'औ', 'ौ'],
];

const VOWEL_SINGLES: Record<string, [string, string]> = {
  a: ['अ', ''],
  i: ['इ', 'ि'],
  u: ['उ', 'ु'],
  e: ['ए', 'े'],
  o: ['ओ', 'ो'],
};

const CONSONANT_DIGRAPHS: Array<[string, string]> = [
  ['kh', 'ख'],
  ['gh', 'घ'],
  ['ch', 'च'],
  ['jh', 'झ'],
  ['th', 'थ'],
  ['dh', 'ध'],
  ['ph', 'फ'],
  ['bh', 'भ'],
  ['sh', 'श'],
  ['ny', 'ञ'],
  ['ng', 'ङ'],
];

const CONSONANT_SINGLES: Record<string, string> = {
  k: 'क',
  g: 'ग',
  c: 'क',
  j: 'ज',
  t: 'त',
  d: 'द',
  n: 'न',
  p: 'प',
  b: 'ब',
  m: 'म',
  y: 'य',
  r: 'र',
  l: 'ल',
  v: 'व',
  w: 'व',
  s: 'स',
  h: 'ह',
  f: 'फ',
};

const HALANT = '्';

function matchVowel(str: string, i: number) {
  for (const [roman, standalone, matra] of VOWEL_DIGRAPHS) {
    if (str.startsWith(roman, i)) return { roman, standalone, matra };
  }
  const ch = str[i];
  const single = VOWEL_SINGLES[ch];
  if (single) return { roman: ch, standalone: single[0], matra: single[1] };
  return null;
}

function matchConsonant(str: string, i: number) {
  for (const [roman, glyph] of CONSONANT_DIGRAPHS) {
    if (str.startsWith(roman, i)) return { roman, glyph };
  }
  const ch = str[i];
  const glyph = CONSONANT_SINGLES[ch];
  if (glyph) return { roman: ch, glyph };
  return null;
}

function transliterateWord(word: string): string {
  const lower = word.toLowerCase();
  let out = '';
  let i = 0;

  while (i < lower.length) {
    const consonant = matchConsonant(lower, i);
    if (consonant) {
      const nextIndex = i + consonant.roman.length;
      const vowel = matchVowel(lower, nextIndex);
      if (vowel) {
        out += consonant.glyph + vowel.matra;
        i = nextIndex + vowel.roman.length;
      } else if (nextIndex >= lower.length) {
        out += consonant.glyph; // word-final: keep the inherent "a"
        i = nextIndex;
      } else {
        out += consonant.glyph + HALANT; // mid-word consonant cluster
        i = nextIndex;
      }
      continue;
    }

    const vowel = matchVowel(lower, i);
    if (vowel) {
      out += vowel.standalone;
      i += vowel.roman.length;
      continue;
    }

    out += lower[i]; // unrecognised character — copy through as-is
    i += 1;
  }

  return out;
}

export function isDevanagari(text: string): boolean {
  return DEVANAGARI_RANGE.test(text);
}

function isPlainEnglish(text: string): boolean {
  return ENGLISH_LETTERS_ONLY.test(text);
}

// Implements the spec's rule set for "Name in Hindi":
// - already Devanagari -> left unchanged
// - plain English -> transliterated
// - anything else (other scripts) -> copied through as-is
export function nameToHindi(name: string): string {
  if (!name) return name;
  if (isDevanagari(name)) return name;
  if (!isPlainEnglish(name)) return name;

  return name
    .split(' ')
    .map((word) => (word ? transliterateWord(word) : word))
    .join(' ');
}
