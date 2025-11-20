# Firebase Cloud Messaging (FCM) Kurulum Rehberi

Bu rehber, flashcards-backend projesine Firebase Cloud Messaging (FCM) push notification desteği eklemek için gerekli adımları açıklar.

## Adım 1: Firebase Projesi Oluşturma

1. [Firebase Console](https://console.firebase.google.com/) sayfasına gidin
2. **Add project** (Proje Ekle) butonuna tıklayın
3. Proje adını girin ve **Continue** (Devam Et) butonuna tıklayın
4. Google Analytics'i açıp/kapatabilirsiniz (opsiyonel)
5. **Create project** (Proje Oluştur) butonuna tıklayın

## Adım 2: Service Account Key Oluşturma

1. Firebase Console'da projenizi seçin
2. Sol menüden **Project Settings** (Proje Ayarları) > **Service accounts** sekmesine gidin
3. **Generate new private key** (Yeni özel anahtar oluştur) butonuna tıklayın
4. JSON dosyası indirilecektir - bu dosyayı güvenli bir yerde saklayın

## Adım 3: Environment Variables Ayarlama

Proje kök dizinindeki `.env` dosyanıza Firebase konfigürasyonunu ekleyin.

### Yöntem 1: Service Account Key JSON (Önerilen - Development)

Service account key JSON dosyasının içeriğini bir environment variable olarak ekleyin:

```env
# Firebase Konfigürasyonu
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project-id",...}'
```

**Önemli:** JSON içeriğini tek satır olarak ve tırnak içinde yazın. Tüm özel karakterleri escape edin.

### Yöntem 2: Ayrı Environment Variables (Önerilen - Production)

Daha güvenli bir yöntem için ayrı environment variables kullanın:

```env
# Firebase Konfigürasyonu
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
```

**Önemli:**

- `FIREBASE_PRIVATE_KEY` içindeki `\n` karakterlerini koruyun
- Private key'i tırnak içine alın

## Adım 4: Server'ı Yeniden Başlatın

```bash
npm run dev
```

Console'da şu mesajı görmelisiniz:

```
✅ Firebase Admin SDK başlatıldı
```

## Adım 5: FCM Token Kaydetme (Frontend)

Frontend uygulamanızda FCM token'ı alıp backend'e göndermeniz gerekiyor:

### React Native Örneği

```typescript
import messaging from "@react-native-firebase/messaging";

// Token al
const token = await messaging().getToken();

// Backend'e gönder
await fetch("http://your-backend-url/api/notifications/fcm-token", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include", // Cookie için
  body: JSON.stringify({ token }),
});
```

### Web (JavaScript) Örneği

```javascript
// Firebase SDK'yı yükleyin
import { getMessaging, getToken } from "firebase/messaging";

const messaging = getMessaging();
const token = await getToken(messaging, {
  vapidKey: "your-vapid-key",
});

// Backend'e gönder
await fetch("http://your-backend-url/api/notifications/fcm-token", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
  body: JSON.stringify({ token }),
});
```

## API Endpoints

### FCM Token Kaydet/Güncelle

```
POST /api/notifications/fcm-token
Authorization: Cookie (JWT token)
Body: { "token": "your-fcm-token" }
```

### FCM Token Kaldır

```
DELETE /api/notifications/fcm-token
Authorization: Cookie (JWT token)
Body: { "token": "your-fcm-token" }
```

## Push Notification Özellikleri

- **Otomatik Gönderim**: Daily reminder ve motivasyon mesajları otomatik olarak push notification olarak gönderilir
- **Çoklu Cihaz Desteği**: Kullanıcılar birden fazla cihazdan token kaydedebilir
- **Geçersiz Token Temizleme**: Geçersiz token'lar otomatik olarak kaldırılır
- **Tercih Yönetimi**: Kullanıcılar push notification'ları açıp kapatabilir

## Notification Tercihleri

Kullanıcılar push notification tercihlerini yönetebilir:

```typescript
// Push notification'ları aç/kapat
PUT /api/notifications/preferences
Body: {
  "pushNotifications": true // veya false
}
```

## Sorun Giderme

### "Firebase başlatılmamış" Hatası

- `.env` dosyasında Firebase konfigürasyonunun doğru olduğundan emin olun
- JSON formatının doğru olduğundan emin olun (tırnak işaretleri, escape karakterleri)
- Server'ı yeniden başlatın

### "Invalid registration token" Hatası

- Token'ın geçerli olduğundan emin olun
- Token'ın doğru formatta olduğundan emin olun
- Firebase projesinin doğru yapılandırıldığından emin olun

### Push Notification Gönderilmiyor

- Kullanıcının FCM token'ının kayıtlı olduğundan emin olun
- `notificationPreferences.pushNotifications` değerinin `false` olmadığından emin olun
- Firebase Console'da projenin aktif olduğundan emin olun

## Güvenlik Notları

- **Service Account Key'i asla Git'e commit etmeyin**
- Production'da environment variables kullanın
- Private key'i güvenli bir şekilde saklayın
- `.env` dosyasını `.gitignore`'a eklediğinizden emin olun

## Test Etme

1. Bir kullanıcı olarak giriş yapın
2. FCM token'ınızı kaydedin: `POST /api/notifications/fcm-token`
3. Test notification gönderin: `POST /api/notifications/test/daily-reminder`
4. Cihazınızda push notification'ı kontrol edin
