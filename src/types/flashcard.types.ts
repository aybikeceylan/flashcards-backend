export interface CreateFlashcardDto {
  word: string;
  translation?: string;
  meaning?: string; // Kelime anlamı (İngilizce açıklama)
  example?: string;
  imageUrl?: string;
  audioUrl?: string;
  phonetic?: string;
  pronunciation?: string;
  partOfSpeech?: string;
}

export interface UpdateFlashcardDto {
  word?: string;
  translation?: string;
  meaning?: string; // Kelime anlamı (İngilizce açıklama)
  example?: string;
  imageUrl?: string;
  audioUrl?: string;
  phonetic?: string;
  pronunciation?: string;
  partOfSpeech?: string;
}
