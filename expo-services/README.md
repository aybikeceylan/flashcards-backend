# Expo Services - Kullanım Rehberi

Bu klasördeki dosyalar, Expo React Native uygulamanızda backend API'yi kullanmak için hazırlanmış servis dosyalarıdır.

## 📦 Kurulum

### 1. Gerekli Paketleri Yükleyin

```bash
npm install axios @react-native-async-storage/async-storage
# veya
yarn add axios @react-native-async-storage/async-storage
```

### 2. Dosyaları Kopyalayın

Bu klasördeki tüm dosyaları Expo projenizin `src/services` klasörüne kopyalayın.

### 3. API Base URL'i Ayarlayın

`api.ts` dosyasındaki `API_BASE_URL` değişkenini kendi backend URL'inizle değiştirin:

```typescript
const API_BASE_URL = __DEV__
  ? "http://YOUR_LOCAL_IP:3000" // Örn: http://192.168.1.100:3000
  : "https://your-production-api.com";
```

**Önemli Notlar:**

- Expo Go'da `localhost` çalışmaz
- Android Emulator: `http://10.0.2.2:3000`
- iOS Simulator: `http://localhost:3000`
- Fiziksel cihaz: Bilgisayarınızın IP adresi

## 📝 Kullanım Örnekleri

### Auth İşlemleri

```typescript
import { login, register, getProfile, logout } from "./services/authService";

// Giriş yap
const handleLogin = async () => {
  try {
    const response = await login({
      email: "user@example.com",
      password: "password123",
    });
    console.log("Giriş başarılı:", response.data);
    // Token otomatik olarak kaydedildi
  } catch (error) {
    console.error("Giriş hatası:", error);
  }
};

// Kayıt ol
const handleRegister = async () => {
  try {
    const response = await register({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });
    console.log("Kayıt başarılı:", response.data);
  } catch (error) {
    console.error("Kayıt hatası:", error);
  }
};

// Profil bilgilerini getir
const loadProfile = async () => {
  try {
    const response = await getProfile();
    console.log("Profil:", response.data);
  } catch (error) {
    console.error("Profil yüklenemedi:", error);
  }
};
```

### Flashcard İşlemleri

```typescript
import {
  getAllFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
} from "./services/flashcardService";

// Tüm flashcard'ları getir
const loadFlashcards = async () => {
  try {
    const response = await getAllFlashcards();
    console.log("Flashcard'lar:", response.data);
  } catch (error) {
    console.error("Flashcard'lar yüklenemedi:", error);
  }
};

// Yeni flashcard oluştur
const createNewFlashcard = async () => {
  try {
    const response = await createFlashcard({
      word: "hello",
      translation: "merhaba",
      example: "Hello, how are you?",
    });
    console.log("Flashcard oluşturuldu:", response.data);
  } catch (error) {
    console.error("Flashcard oluşturulamadı:", error);
  }
};
```

### Dosya Yükleme

```typescript
import * as ImagePicker from "expo-image-picker";
import { uploadImage, getImageUrl } from "./services/uploadService";

// Resim seç ve yükle
const pickAndUploadImage = async () => {
  try {
    // İzin iste
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Galeri erişim izni gerekli!");
      return;
    }

    // Resim seç
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // Resmi yükle
      const uploadResponse = await uploadImage(result.assets[0].uri);
      const imageUrl = getImageUrl(uploadResponse.data.url);
      console.log("Resim yüklendi:", imageUrl);

      // Flashcard oluştururken kullan
      await createFlashcard({
        word: "hello",
        imageUrl: imageUrl,
      });
    }
  } catch (error) {
    console.error("Resim yükleme hatası:", error);
  }
};
```

## 🔐 Token Yönetimi

Token'lar otomatik olarak AsyncStorage'da saklanır ve her istekte Authorization header'ına eklenir. Token geçersizse otomatik olarak temizlenir.

## 🐛 Hata Yönetimi

Tüm servisler hataları yakalar ve uygun şekilde yönetir. 401 (Unauthorized) hatası durumunda token otomatik olarak temizlenir.

## 📚 Daha Fazla Bilgi

Backend API dokümantasyonu için: `http://localhost:3000/api-docs`
