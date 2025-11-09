import mongoose, { Schema, Document } from "mongoose";

export interface IFlashcard extends Document {
  word: string;
  translation?: string;
  example?: string;
  imageUrl?: string;
  audioUrl?: string;
}

const flashcardSchema: Schema<IFlashcard> = new Schema(
  {
    word: { type: String, required: true },
    translation: { type: String },
    example: { type: String },
    imageUrl: { type: String },
    audioUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IFlashcard>("Flashcard", flashcardSchema);
