# Expo React Native Entegrasyon Rehberi

Bu dosya, backend API'yi Expo React Native uygulamanıza entegre etmek için gerekli adımları içerir.

## 📋 İçindekiler

1. [Kurulum](#kurulum)
2. [API Servis Dosyaları](#api-servis-dosyaları)
3. [Kullanım Örnekleri](#kullanım-örnekleri)
4. [Token Yönetimi](#token-yönetimi)

## 🚀 Kurulum

### 1. Gerekli Paketleri Yükleyin

```bash
cd your-expo-project
npm install axios @react-native-async-storage/async-storage
# veya
yarn add axios @react-native-async-storage/async-storage
```

### 2. API Base URL'i Ayarlayın

`.env` dosyanızda veya `config.ts` dosyanızda:

```typescript
export const API_BASE_URL = __DEV__
  ? "http://localhost:3000" // Development
  : "https://your-production-api.com"; // Production
```

**Önemli:** Expo Go'da `localhost` çalışmaz. Gerçek cihazda veya emülatörde test ediyorsanız:

- Android Emulator: `http://10.0.2.2:3000`
- iOS Simulator: `http://localhost:3000`
- Fiziksel cihaz: Bilgisayarınızın IP adresi (örn: `http://192.168.1.100:3000`)

## 📁 API Servis Dosyaları

Aşağıdaki dosyaları Expo projenizin `src/services` klasörüne ekleyin:

1. `api.ts` - Base API client
2. `authService.ts` - Auth işlemleri
3. `flashcardService.ts` - Flashcard işlemleri
4. `uploadService.ts` - Dosya yükleme işlemleri

## 🔑 Token Yönetimi

Backend'de token hem cookie'de hem de response body'de gönderiliyor. React Native'de token'ı AsyncStorage'da saklayıp her istekte Authorization header'ında göndermeniz gerekiyor.

## 📝 Kullanım Örnekleri

Detaylı örnekler için aşağıdaki servis dosyalarına bakın.
