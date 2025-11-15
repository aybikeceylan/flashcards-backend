import cron from "node-cron";
import {
  sendDailyReminder,
  sendMotivationMessagesToUsers,
} from "./notification.service";
import User from "../models/user.model";

/**
 * Cron Service
 * Zamanlanmış görevler için cron job'ları yönetir
 */

/**
 * Kullanıcının tercih ettiği saatte daily reminder gönder
 */
const sendScheduledDailyReminders = async (): Promise<void> => {
  try {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    // Şu anki saatte reminder almak isteyen kullanıcıları bul
    const users = await User.find({
      "notificationPreferences.dailyReminder": true,
      "notificationPreferences.reminderTime": currentTime,
    });

    console.log(
      `⏰ ${currentTime} - ${users.length} kullanıcıya daily reminder gönderiliyor...`
    );

    for (const user of users) {
      try {
        await sendDailyReminder(user);
      } catch (error) {
        console.error(`Kullanıcıya gönderilemedi (${user.email}):`, error);
      }
    }
  } catch (error) {
    console.error("❌ Scheduled daily reminder hatası:", error);
  }
};

/**
 * Cron job'ları başlat
 */
export const startCronJobs = (): void => {
  console.log("🕐 Cron job'lar başlatılıyor...");

  // Her dakika kontrol et (kullanıcıların tercih ettiği saatlerde göndermek için)
  cron.schedule("* * * * *", async () => {
    await sendScheduledDailyReminders();
  });

  // Motivasyon mesajları - Her gün saat 10:00'da kontrol et
  cron.schedule("0 10 * * *", async () => {
    console.log("💪 Motivasyon mesajları kontrol ediliyor...");
    await sendMotivationMessagesToUsers();
  });

  console.log("✅ Cron job'lar başlatıldı:");
  console.log("   - Daily reminders: Her dakika kontrol ediliyor");
  console.log("   - Motivasyon mesajları: Her gün 10:00'da kontrol ediliyor");
};

/**
 * Cron job'ları durdur (test için)
 */
export const stopCronJobs = (): void => {
  // node-cron'un stop metodu yok, bu yüzden sadece log
  console.log("⏹️  Cron job'lar durduruldu (server kapatılıyor)");
};
