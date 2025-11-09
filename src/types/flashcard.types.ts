export interface CreateFlashcardDto {
  word: string;
  translation?: string;
  example?: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface UpdateFlashcardDto {
  word?: string;
  translation?: string;
  example?: string;
  imageUrl?: string;
  audioUrl?: string;
}
