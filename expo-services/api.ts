/**
 * Base API Client
 * Expo React Native uygulaması için API servis dosyası
 *
 * Kullanım:
 * 1. Bu dosyayı Expo projenizin src/services/api.ts konumuna kopyalayın
 * 2. API_BASE_URL'i kendi backend URL'inizle değiştirin
 */

import axios, { AxiosInstance, AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Type declaration for React Native global
declare const __DEV__: boolean;

// API Base URL - Kendi backend URL'inizi buraya yazın
const API_BASE_URL = __DEV__
  ? "http://localhost:3000" // Development
  : "https://your-production-api.com"; // Production

// Token storage key
const TOKEN_KEY = "@flashcards_token";

// Axios instance oluştur
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Token'ı header'a ekle
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Token alınamadı:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Hata yönetimi
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token geçersizse temizle
      await AsyncStorage.removeItem(TOKEN_KEY);
      // Login ekranına yönlendir (navigation hook'u kullanabilirsiniz)
    }
    return Promise.reject(error);
  }
);

// Token yönetimi fonksiyonları
export const tokenStorage = {
  setToken: async (token: string) => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error("Token kaydedilemedi:", error);
    }
  },
  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error("Token alınamadı:", error);
      return null;
    }
  },
  removeToken: async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error("Token silinemedi:", error);
    }
  },
};

export default api;
