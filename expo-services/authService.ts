/**
 * Auth Service
 * Kullanıcı kayıt, giriş, çıkış ve profil işlemleri
 *
 * Kullanım:
 * Bu dosyayı Expo projenizin src/services/authService.ts konumuna kopyalayın
 */

import api, { tokenStorage } from "./api";

// Types
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  data: User & { token?: string };
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Register - Yeni kullanıcı kaydı
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/api/auth/register", data);

  // Token'ı kaydet
  if (response.data.data.token) {
    await tokenStorage.setToken(response.data.data.token);
  }

  return response.data;
};

// Login - Kullanıcı girişi
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/api/auth/login", data);

  // Token'ı kaydet
  if (response.data.data.token) {
    await tokenStorage.setToken(response.data.data.token);
  }

  return response.data;
};

// Logout - Kullanıcı çıkışı
export const logout = async (): Promise<void> => {
  try {
    await api.post("/api/auth/logout");
  } catch (error) {
    console.error("Logout hatası:", error);
  } finally {
    // Token'ı temizle
    await tokenStorage.removeToken();
  }
};

// Get Me - Mevcut kullanıcı bilgilerini getir
export const getMe = async (): Promise<ApiResponse<User>> => {
  const response = await api.get<ApiResponse<User>>("/api/auth/me");
  return response.data;
};

// Get Profile - Profil bilgilerini getir
export const getProfile = async (): Promise<ApiResponse<User>> => {
  const response = await api.get<ApiResponse<User>>("/api/auth/profile");
  return response.data;
};

// Update Profile - Profil bilgilerini güncelle
export const updateProfile = async (
  data: Partial<Pick<User, "name" | "email">>
): Promise<ApiResponse<User>> => {
  const response = await api.put<ApiResponse<User>>("/api/auth/profile", data);
  return response.data;
};

// Update Password - Şifre değiştir
export const updatePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<ApiResponse<null>> => {
  const response = await api.put<ApiResponse<null>>(
    "/api/auth/profile/password",
    data
  );
  return response.data;
};

// Delete Account - Hesabı sil
export const deleteAccount = async (): Promise<ApiResponse<null>> => {
  const response = await api.delete<ApiResponse<null>>("/api/auth/profile");
  await tokenStorage.removeToken();
  return response.data;
};
