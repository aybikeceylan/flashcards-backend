/**
 * Flashcard Service
 * Flashcard CRUD işlemleri
 *
 * Kullanım:
 * Bu dosyayı Expo projenizin src/services/flashcardService.ts konumuna kopyalayın
 */

import api from "./api";

// Types
export interface Flashcard {
  _id: string;
  word: string;
  translation?: string;
  example?: string;
  imageUrl?: string;
  audioUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFlashcardData {
  word: string;
  translation?: string;
  example?: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface UpdateFlashcardData extends Partial<CreateFlashcardData> {}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Get All Flashcards - Tüm flashcard'ları getir
export const getAllFlashcards = async (): Promise<ApiResponse<Flashcard[]>> => {
  const response = await api.get<ApiResponse<Flashcard[]>>("/api/flashcards");
  return response.data;
};

// Get Flashcard By ID - ID'ye göre flashcard getir
export const getFlashcardById = async (
  id: string
): Promise<ApiResponse<Flashcard>> => {
  const response = await api.get<ApiResponse<Flashcard>>(
    `/api/flashcards/${id}`
  );
  return response.data;
};

// Create Flashcard - Yeni flashcard oluştur
export const createFlashcard = async (
  data: CreateFlashcardData
): Promise<ApiResponse<Flashcard>> => {
  const response = await api.post<ApiResponse<Flashcard>>(
    "/api/flashcards",
    data
  );
  return response.data;
};

// Create Flashcard with Files - Dosyalarla birlikte flashcard oluştur
export const createFlashcardWithFiles = async (
  data: CreateFlashcardData,
  imageUri?: string,
  audioUri?: string
): Promise<ApiResponse<Flashcard>> => {
  const formData = new FormData();

  // Text alanları
  formData.append("word", data.word);
  if (data.translation) {
    formData.append("translation", data.translation);
  }
  if (data.example) {
    formData.append("example", data.example);
  }

  // Dosyalar
  if (imageUri) {
    const imageFile = {
      uri: imageUri,
      type: "image/jpeg",
      name: "image.jpg",
    } as any;
    formData.append("image", imageFile);
  }

  if (audioUri) {
    const audioFile = {
      uri: audioUri,
      type: "audio/mpeg",
      name: "audio.mp3",
    } as any;
    formData.append("audio", audioFile);
  }

  const response = await api.post<ApiResponse<Flashcard>>(
    "/api/flashcards",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// Update Flashcard - Flashcard güncelle
export const updateFlashcard = async (
  id: string,
  data: UpdateFlashcardData
): Promise<ApiResponse<Flashcard>> => {
  const response = await api.put<ApiResponse<Flashcard>>(
    `/api/flashcards/${id}`,
    data
  );
  return response.data;
};

// Delete Flashcard - Flashcard sil
export const deleteFlashcard = async (
  id: string
): Promise<ApiResponse<Flashcard>> => {
  const response = await api.delete<ApiResponse<Flashcard>>(
    `/api/flashcards/${id}`
  );
  return response.data;
};
