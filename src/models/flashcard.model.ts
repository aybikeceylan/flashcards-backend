import mongoose, { Schema, Document } from "mongoose";

export interface IFlashcard extends Document {
  word: string;
  translation?: string;
  example?: string;
  imageUrl?: string;
  audioUrl?: string;
  phonetic?: string; // Telaffuz yazılışı (örn: /həˈloʊ/)
  pronunciation?: string; // Telaffuz audio URL'i
  partOfSpeech?: string; // Kelime türü (noun, verb, adjective, etc.)
}

const flashcardSchema: Schema<IFlashcard> = new Schema(
  {
    word: { type: String, required: true },
    translation: { type: String },
    example: { type: String },
    imageUrl: { type: String },
    audioUrl: { type: String },
    phonetic: { type: String }, // Telaffuz yazılışı
    pronunciation: { type: String }, // Telaffuz audio URL'i
    partOfSpeech: { type: String }, // Kelime türü
  },
  { timestamps: true }
);

export default mongoose.model<IFlashcard>("Flashcard", flashcardSchema);
