import * as admin from "firebase-admin";

/**
 * Firebase Admin SDK Utility
 * FCM (Firebase Cloud Messaging) ile push notification göndermek için
 */

// Firebase Admin SDK'yı başlat
let firebaseApp: admin.app.App | null = null;

/**
 * Firebase Admin SDK'yı başlat
 * Service account key JSON dosyası veya environment variables kullanılabilir
 */
export const initializeFirebase = (): void => {
  if (firebaseApp) {
    console.log("✅ Firebase zaten başlatılmış");
    return;
  }

  try {
    // Environment variable'dan service account key al
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccountKey) {
      // JSON string olarak environment variable'dan al
      const serviceAccount = JSON.parse(serviceAccountKey);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // Environment variables ile başlat (production için daha güvenli)
      firebaseApp = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });
    } else {
      console.warn(
        "⚠️  Firebase konfigürasyonu bulunamadı. Push notification'lar gönderilemeyecek."
      );
      return;
    }

    console.log("✅ Firebase Admin SDK başlatıldı");
  } catch (error: any) {
    console.error("❌ Firebase başlatma hatası:", error.message);
    console.warn(
      "⚠️  Push notification'lar gönderilemeyecek. Firebase konfigürasyonunu kontrol edin."
    );
  }
};

/**
 * Firebase Admin SDK instance'ını al
 */
export const getFirebaseApp = (): admin.app.App | null => {
  return firebaseApp;
};

/**
 * FCM ile push notification gönder
 * @param token FCM token (device token)
 * @param title Notification başlığı
 * @param body Notification içeriği
 * @param data Ek data (opsiyonel)
 */
export const sendPushNotification = async (
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> => {
  if (!firebaseApp) {
    throw new Error(
      "Firebase başlatılmamış. Lütfen Firebase konfigürasyonunu kontrol edin."
    );
  }

  const message: admin.messaging.Message = {
    token,
    notification: {
      title,
      body,
    },
    data: data || {},
    android: {
      priority: "high" as const,
      notification: {
        sound: "default",
        channelId: "default",
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
          badge: 1,
        },
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log(`✅ Push notification gönderildi: ${response}`);
  } catch (error: any) {
    console.error(`❌ Push notification gönderme hatası:`, error);

    // Token geçersizse veya kayıtlı değilse hata fırlat
    if (
      error.code === "messaging/invalid-registration-token" ||
      error.code === "messaging/registration-token-not-registered"
    ) {
      throw new Error("INVALID_TOKEN");
    }

    throw error;
  }
};

/**
 * Birden fazla token'a push notification gönder
 * @param tokens FCM token array
 * @param title Notification başlığı
 * @param body Notification içeriği
 * @param data Ek data (opsiyonel)
 * @returns Başarılı ve başarısız token'ları döndürür
 */
export const sendPushNotificationToMultiple = async (
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ success: string[]; failed: string[] }> => {
  if (!firebaseApp) {
    throw new Error(
      "Firebase başlatılmamış. Lütfen Firebase konfigürasyonunu kontrol edin."
    );
  }

  if (tokens.length === 0) {
    return { success: [], failed: [] };
  }

  const message: admin.messaging.MulticastMessage = {
    tokens,
    notification: {
      title,
      body,
    },
    data: data || {},
    android: {
      priority: "high" as const,
      notification: {
        sound: "default",
        channelId: "default",
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
          badge: 1,
        },
      },
    },
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);

    const success: string[] = [];
    const failed: string[] = [];

    response.responses.forEach((resp, idx) => {
      if (resp.success) {
        success.push(tokens[idx]);
      } else {
        failed.push(tokens[idx]);
        console.error(`Token gönderilemedi (${tokens[idx]}):`, resp.error);
      }
    });

    console.log(
      `✅ Push notification gönderimi: ${success.length} başarılı, ${failed.length} başarısız`
    );

    return { success, failed };
  } catch (error: any) {
    console.error(`❌ Push notification gönderme hatası:`, error);
    throw error;
  }
};
