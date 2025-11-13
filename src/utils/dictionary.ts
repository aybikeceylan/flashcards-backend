/**
 * Dictionary Service
 * Ücretsiz sözlük API'leri kullanarak kelime bilgileri çeker
 */

export interface DictionaryResult {
  word: string;
  phonetic?: string; // Telaffuz yazılışı (örn: /həˈloʊ/)
  pronunciation?: string; // Telaffuz audio URL'i
  meanings: {
    partOfSpeech: string; // noun, verb, adjective, etc.
    definitions: {
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }[];
  }[];
  exampleSentences?: string[];
}

/**
 * Free Dictionary API kullanarak kelime bilgilerini çek
 * API: https://dictionaryapi.dev/
 * Ücretsiz, API key gerektirmez
 */
export const fetchWordFromDictionary = async (
  word: string
): Promise<DictionaryResult | null> => {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
        word.toLowerCase()
      )}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Kelime bulunamadı: ${word}`);
        return null;
      }
      throw new Error(`Dictionary API error: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const entry = data[0];

    // Phonetic bilgisini bul (farklı formatlarda olabilir)
    const phonetic =
      entry.phonetic ||
      entry.phonetics?.find((p: any) => p.text)?.text ||
      entry.phonetics?.[0]?.text;

    // Audio URL'ini bul
    const pronunciation =
      entry.phonetics?.find((p: any) => p.audio)?.audio ||
      entry.phonetics?.[0]?.audio;

    // Meanings ve definitions'ları parse et
    const meanings =
      entry.meanings?.map((meaning: any) => ({
        partOfSpeech: meaning.partOfSpeech || "unknown",
        definitions:
          meaning.definitions?.map((def: any) => ({
            definition: def.definition || "",
            example: def.example || undefined,
            synonyms: def.synonyms || [],
            antonyms: def.antonyms || [],
          })) || [],
      })) || [];

    // Örnek cümleleri topla
    const exampleSentences: string[] = [];
    meanings.forEach((meaning: any) => {
      meaning.definitions.forEach((def: any) => {
        if (def.example) {
          exampleSentences.push(def.example);
        }
      });
    });

    return {
      word: entry.word || word,
      phonetic,
      pronunciation,
      meanings,
      exampleSentences:
        exampleSentences.length > 0 ? exampleSentences : undefined,
    };
  } catch (error: any) {
    console.error(`Dictionary API hatası (${word}):`, error.message);
    return null;
  }
};

/**
 * Google Text-to-Speech kullanarak telaffuz audio URL'i oluştur
 * Ücretsiz, API key gerektirmez (tarayıcı tabanlı)
 * Alternatif: Backend'de audio dosyası oluşturup kaydetmek için
 * Google Cloud TTS veya başka bir servis kullanılabilir
 */
export const getPronunciationUrl = (
  word: string,
  language: string = "en"
): string => {
  // Google Translate TTS API (ücretsiz, rate limit var)
  // Alternatif olarak backend'de audio dosyası oluşturulabilir
  const encodedWord = encodeURIComponent(word);
  return `https://translate.google.com/translate_tts?ie=UTF-8&tl=${language}&client=tw-ob&q=${encodedWord}`;
};

/**
 * Google Search Suggestions API kullanarak kelime önerileri çek
 * Ücretsiz, API key gerektirmez
 * Rate limit: ~100 istek/dakika
 */
export const getGoogleSuggestions = async (
  query: string,
  language: string = "en"
): Promise<string[]> => {
  try {
    if (!query || query.length < 2) {
      return [];
    }

    // Google Search Suggestions API
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=${language}&q=${encodeURIComponent(
      query
    )}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    // Google Suggestions API formatı: [query, [suggestions], ...]
    if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
      return data[1].slice(0, 10); // İlk 10 öneriyi al
    }

    return [];
  } catch (error: any) {
    console.error(`Google Suggestions API hatası (${query}):`, error.message);
    return [];
  }
};
