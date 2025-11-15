import nodemailer from "nodemailer";
import User from "../models/user.model";
import Flashcard from "../models/flashcard.model";
import Notification from "../models/notification.model";
import { IUser } from "../models/user.model";

/**
 * Notification Service
 * Daily reminder ve motivasyon mesajları göndermek için
 */

// Email transporter oluştur
const createTransporter = () => {
  const config: any = {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  };

  if (config.host === "smtp.gmail.com" && !config.secure) {
    config.requireTLS = true;
    config.tls = {
      rejectUnauthorized: false,
    };
  }

  return nodemailer.createTransport(config);
};

/**
 * Motivasyon mesajları listesi
 */
const motivationMessages = [
  {
    title: "Harika İş Çıkarıyorsun! 🎉",
    message:
      "Her gün yeni kelimeler öğrenmek seni hedefine bir adım daha yaklaştırıyor. Bugün de devam et!",
  },
  {
    title: "Küçük Adımlar, Büyük Sonuçlar! 💪",
    message:
      "Her flashcard bir yatırım. Bugün öğrendiğin kelimeler, yarın akıcı konuşmanın temelini oluşturacak.",
  },
  {
    title: "Tutarlılık Güçtür! ⚡",
    message:
      "Her gün 10 dakika ayırmak, haftada bir saat çalışmaktan çok daha etkili. Sen doğru yoldasın!",
  },
  {
    title: "İlerlemen Harika! 🌟",
    message:
      "Öğrendiğin her yeni kelime, dil yolculuğunda bir kilometre taşı. Devam et!",
  },
  {
    title: "Sen Bir Şampiyonsun! 🏆",
    message:
      "Dil öğrenmek sabır ister ve sen bu sabrı gösteriyorsun. Bugün de yeni kelimeler öğrenmeye hazır mısın?",
  },
  {
    title: "Her Gün Biraz Daha İyi! 📈",
    message:
      "Dün öğrendiğin kelimeler bugün daha iyi hatırlanıyor. Bu ilerleme harika!",
  },
  {
    title: "Hedefine Yaklaşıyorsun! 🎯",
    message:
      "Her flashcard ile hedefine bir adım daha yaklaşıyorsun. Bugün de devam et!",
  },
];

/**
 * Rastgele motivasyon mesajı seç
 */
const getRandomMotivationMessage = () => {
  const randomIndex = Math.floor(Math.random() * motivationMessages.length);
  return motivationMessages[randomIndex];
};

/**
 * Daily reminder email gönder
 */
export const sendDailyReminder = async (user: IUser): Promise<void> => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error("Email konfigürasyonu bulunamadı.");
  }

  const transporter = createTransporter();

  // Kullanıcının flashcard sayısını al
  const flashcardCount = await Flashcard.countDocuments();

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || "Flashcards App"}" <${
      process.env.EMAIL_USER
    }>`,
    to: user.email,
    subject: "📚 Günlük Hatırlatma - Flashcard Çalışma Zamanı!",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Günlük Hatırlatma</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">📚 Günlük Hatırlatma</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Merhaba <strong>${user.name}</strong>,
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Flashcard çalışma zamanı! Bugün yeni kelimeler öğrenmeye hazır mısın?
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea;">
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #667eea;">
                📊 Toplam Flashcard: ${flashcardCount}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;">
                Çalışmaya Başla
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              <strong>💡 İpucu:</strong> Her gün düzenli çalışmak, haftada bir uzun çalışmaktan çok daha etkilidir!
            </p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
              Bu email otomatik olarak gönderilmiştir. Bildirimleri kapatmak için uygulama ayarlarından değiştirebilirsiniz.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
Günlük Hatırlatma

Merhaba ${user.name},

Flashcard çalışma zamanı! Bugün yeni kelimeler öğrenmeye hazır mısın?

Toplam Flashcard: ${flashcardCount}

Uygulamaya git: ${process.env.FRONTEND_URL || "http://localhost:3000"}

💡 İpucu: Her gün düzenli çalışmak, haftada bir uzun çalışmaktan çok daha etkilidir!

Bu email otomatik olarak gönderilmiştir.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);

    // Notification kaydı oluştur
    await Notification.create({
      userId: user._id,
      type: "daily_reminder",
      email: user.email,
      subject: mailOptions.subject,
      status: "sent",
    });

    console.log(`✅ Daily reminder gönderildi: ${user.email}`);
  } catch (error: any) {
    console.error(`❌ Daily reminder gönderme hatası (${user.email}):`, error);

    // Hata kaydı oluştur
    await Notification.create({
      userId: user._id,
      type: "daily_reminder",
      email: user.email,
      subject: mailOptions.subject,
      status: "failed",
      errorMessage: error.message,
    });

    throw error;
  }
};

/**
 * Motivasyon mesajı gönder
 */
export const sendMotivationMessage = async (user: IUser): Promise<void> => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error("Email konfigürasyonu bulunamadı.");
  }

  const transporter = createTransporter();
  const motivation = getRandomMotivationMessage();

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || "Flashcards App"}" <${
      process.env.EMAIL_USER
    }>`,
    to: user.email,
    subject: `💪 ${motivation.title}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Motivasyon Mesajı</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">${motivation.title}</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Merhaba <strong>${user.name}</strong>,
            </p>
            
            <p style="font-size: 18px; margin-bottom: 30px; text-align: center; font-style: italic; color: #555;">
              "${motivation.message}"
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}" 
                 style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;">
                Devam Et
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
              Bu email otomatik olarak gönderilmiştir. Bildirimleri kapatmak için uygulama ayarlarından değiştirebilirsiniz.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
${motivation.title}

Merhaba ${user.name},

${motivation.message}

Uygulamaya git: ${process.env.FRONTEND_URL || "http://localhost:3000"}

Bu email otomatik olarak gönderilmiştir.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);

    // Notification kaydı oluştur
    await Notification.create({
      userId: user._id,
      type: "motivation",
      email: user.email,
      subject: mailOptions.subject,
      status: "sent",
    });

    console.log(`✅ Motivasyon mesajı gönderildi: ${user.email}`);
  } catch (error: any) {
    console.error(
      `❌ Motivasyon mesajı gönderme hatası (${user.email}):`,
      error
    );

    // Hata kaydı oluştur
    await Notification.create({
      userId: user._id,
      type: "motivation",
      email: user.email,
      subject: mailOptions.subject,
      status: "failed",
      errorMessage: error.message,
    });

    throw error;
  }
};

/**
 * Tüm aktif kullanıcılara daily reminder gönder
 */
export const sendDailyRemindersToAllUsers = async (): Promise<void> => {
  try {
    // Daily reminder açık olan kullanıcıları bul
    const users = await User.find({
      "notificationPreferences.dailyReminder": true,
    });

    console.log(
      `📧 ${users.length} kullanıcıya daily reminder gönderiliyor...`
    );

    for (const user of users) {
      try {
        await sendDailyReminder(user);
      } catch (error) {
        // Bir kullanıcıya gönderilemezse diğerlerine devam et
        console.error(`Kullanıcıya gönderilemedi (${user.email}):`, error);
      }
    }

    console.log(`✅ Daily reminder gönderimi tamamlandı`);
  } catch (error) {
    console.error("❌ Daily reminder gönderim hatası:", error);
    throw error;
  }
};

/**
 * Motivasyon mesajı göndermesi gereken kullanıcıları bul ve gönder
 */
export const sendMotivationMessagesToUsers = async (): Promise<void> => {
  try {
    // Motivasyon mesajları açık olan kullanıcıları bul
    const users = await User.find({
      "notificationPreferences.motivationMessages": true,
    });

    console.log(
      `💪 ${users.length} kullanıcıya motivasyon mesajı gönderiliyor...`
    );

    for (const user of users) {
      try {
        // Son motivasyon mesajını kontrol et
        const lastMotivation = await Notification.findOne({
          userId: user._id,
          type: "motivation",
        }).sort({ sentAt: -1 });

        if (lastMotivation) {
          const daysSinceLastMessage = Math.floor(
            (Date.now() - lastMotivation.sentAt.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          const frequency =
            user.notificationPreferences?.motivationFrequency || "weekly";
          const frequencyDays =
            frequency === "daily" ? 1 : frequency === "weekly" ? 7 : 14;

          // Eğer son mesajdan yeterli süre geçmediyse atla
          if (daysSinceLastMessage < frequencyDays) {
            continue;
          }
        }

        await sendMotivationMessage(user);
      } catch (error) {
        // Bir kullanıcıya gönderilemezse diğerlerine devam et
        console.error(`Kullanıcıya gönderilemedi (${user.email}):`, error);
      }
    }

    console.log(`✅ Motivasyon mesajı gönderimi tamamlandı`);
  } catch (error) {
    console.error("❌ Motivasyon mesajı gönderim hatası:", error);
    throw error;
  }
};
