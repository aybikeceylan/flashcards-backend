/**
 * Upload Service
 * Resim ve ses dosyası yükleme işlemleri
 *
 * Kullanım:
 * Bu dosyayı Expo projenizin src/services/uploadService.ts konumuna kopyalayın
 *
 * Not: Expo'da dosya seçmek için expo-image-picker veya expo-document-picker kullanın
 */

import api from "./api";

// Types
export interface UploadResponse {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
  type?: "image" | "audio";
  fieldname?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Upload Image - Resim yükle
export const uploadImage = async (
  imageUri: string
): Promise<ApiResponse<UploadResponse>> => {
  const formData = new FormData();

  const imageFile = {
    uri: imageUri,
    type: "image/jpeg",
    name: "image.jpg",
  } as any;

  formData.append("image", imageFile);

  const response = await api.post<ApiResponse<UploadResponse>>(
    "/api/upload/image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// Upload Audio - Ses dosyası yükle
export const uploadAudio = async (
  audioUri: string
): Promise<ApiResponse<UploadResponse>> => {
  const formData = new FormData();

  const audioFile = {
    uri: audioUri,
    type: "audio/mpeg",
    name: "audio.mp3",
  } as any;

  formData.append("audio", audioFile);

  const response = await api.post<ApiResponse<UploadResponse>>(
    "/api/upload/audio",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// Upload Files - Hem resim hem ses yükle
export const uploadFiles = async (
  imageUri?: string,
  audioUri?: string
): Promise<ApiResponse<UploadResponse[]>> => {
  const formData = new FormData();

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

  const response = await api.post<ApiResponse<UploadResponse[]>>(
    "/api/upload/files",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// Get Full Image URL - Tam resim URL'i oluştur
export const getImageUrl = (imagePath: string): string => {
  const baseUrl = api.defaults.baseURL || "";
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  return `${baseUrl}${imagePath}`;
};

// Get Full Audio URL - Tam ses URL'i oluştur
export const getAudioUrl = (audioPath: string): string => {
  const baseUrl = api.defaults.baseURL || "";
  if (audioPath.startsWith("http")) {
    return audioPath;
  }
  return `${baseUrl}${audioPath}`;
};
