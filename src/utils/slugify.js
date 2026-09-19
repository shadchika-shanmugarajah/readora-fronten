const independentVowels = {
  // Tamil
  'அ': 'a', 'ஆ': 'aa', 'இ': 'i', 'ஈ': 'ee', 'உ': 'u', 'ஊ': 'oo',
  'எ': 'e', 'ஏ': 'ae', 'ஐ': 'ai', 'ஒ': 'o', 'ஓ': 'oo', 'ஔ': 'au',
  'ஃ': 'h',
  // Sinhala
  'අ': 'a', 'ආ': 'aa', 'ඇ': 'ae', 'ඈ': 'aae', 'ඉ': 'i', 'ඊ': 'ee',
  'උ': 'u', 'ඌ': 'oo', 'එ': 'e', 'ඒ': 'ae', 'ඔ': 'o', 'ඕ': 'oo'
};

const consonants = {
  // Tamil
  'க': 'k', 'ங': 'ng', 'ச': 's', 'ஞ': 'ny', 'ட': 't', 'ண': 'n',
  'த': 'th', 'ந': 'n', 'ப': 'p', 'ம': 'm', 'ய': 'y', 'ர': 'r',
  'ல': 'l', 'வ': 'v', 'ழ': 'zh', 'ள': 'l', 'ற': 'r', 'ன': 'n',
  'ஜ': 'j', 'ஷ': 'sh', 'ஸ': 's', 'ஹ': 'h',
  // Sinhala
  'ක': 'k', 'ග': 'g', 'ච': 'ch', 'ජ': 'j', 'ට': 't', 'ඩ': 'd',
  'ණ': 'n', 'ත': 'th', 'ද': 'd', 'න': 'n', 'ප': 'p', 'බ': 'b',
  'ම': 'm', 'ය': 'y', 'ර': 'r', 'ල': 'l', 'ව': 'v', 'ස': 's',
  'හ': 'h', 'ළ': 'l'
};

const vowelDiacritics = {
  // Tamil diacritics
  '\u0bbe': 'a', // ா (aa)
  '\u0bbf': 'i', // ி (i)
  '\u0bc0': 'ee', // ீ (ee)
  '\u0bc1': 'u', // ு (u)
  '\u0bc2': 'oo', // ூ (oo)
  '\u0bc6': 'e', // ெ (e)
  '\u0bc7': 'ae', // ே (ae)
  '\u0bc8': 'ai', // ை (ai)
  '\u0bca': 'o', // ொ (o)
  '\u0bcb': 'oo', // ோ (oo)
  '\u0bcc': 'au', // ௌ (au)
  '\u0bcd': '',   // ் (pulli)
  // Sinhala diacritics
  '\u0dcf': 'a',   // ා
  '\u0dd0': 'ae',  // ැ
  '\u0dd1': 'aae', // ෑ
  '\u0dd2': 'i',   // ි
  '\u0dd3': 'ee',  // ී
  '\u0dd4': 'u',   // ු
  '\u0dd6': 'oo',  // ූ
  '\u0dd9': 'e',   // ෙ
  '\u0dda': 'ae',  // ේ
  '\u0ddc': 'o',   // ො
  '\u0ddd': 'oo',  // ෝ
  '\u0dca': ''     // ් (hal kireema)
};

export function transliterateTamilToLatin(text) {
  if (!text) return '';
  let result = '';
  const chars = Array.from(text);
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    
    if (independentVowels[char] !== undefined) {
      result += independentVowels[char];
    } else if (consonants[char] !== undefined) {
      const nextChar = chars[i + 1];
      if (nextChar && vowelDiacritics[nextChar] !== undefined) {
        result += consonants[char] + vowelDiacritics[nextChar];
        i++;
      } else {
        result += consonants[char] + 'a';
      }
    } else {
      result += char;
    }
  }
  return result;
}

export function slugify(text) {
  if (!text) return '';
  let transliterated = transliterateTamilToLatin(text.trim().toLowerCase());
  return transliterated
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
