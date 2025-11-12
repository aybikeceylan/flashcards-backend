import nodemailer from "nodemailer";

/**
 * Email Utility
 * Nodemailer ile email gönderme servisi
 */

// Email konfigürasyonu - Environment variables'dan al
const createTransporter = () => {
  // Gmail için örnek konfigürasyon
  // Production'da daha güvenli bir SMTP servisi kullanılmalı (SendGrid, AWS SES, vb.)
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Gmail için App Password kullanılmalı
    },
  });
};

/**
 * Şifre sıfırlama emaili gönder
 */
export const sendResetPasswordEmail = async (
  email: string,
  resetToken: string
): Promise<void> => {
  // Email konfigürasyonu yoksa hata fırlat
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error(
      "Email konfigürasyonu bulunamadı. EMAIL_USER ve EMAIL_PASSWORD environment variable'larını ayarlayın."
    );
  }

  const transporter = createTransporter();

  // Reset URL oluştur (frontend URL'i)
  const resetUrl = `${
    process.env.FRONTEND_URL || "http://localhost:3000"
  }/reset-password?token=${resetToken}`;

  // Email içeriği
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || "Flashcards App"}" <${
      process.env.EMAIL_USER
    }>`,
    to: email,
    subject: "Şifre Sıfırlama Talebi",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Şifre Sıfırlama</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Şifre Sıfırlama</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Merhaba,
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Şifrenizi sıfırlamak için aşağıdaki linke tıklayın. Bu link <strong>1 saat</strong> geçerlidir.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;">
                Şifremi Sıfırla
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Eğer buton çalışmıyorsa, aşağıdaki linki tarayıcınıza kopyalayıp yapıştırabilirsiniz:
            </p>
            
            <p style="font-size: 12px; color: #999; word-break: break-all; background: #fff; padding: 10px; border-radius: 5px; border: 1px solid #e0e0e0;">
              ${resetUrl}
            </p>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              <strong>Önemli:</strong> Eğer bu talebi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz. Şifreniz değişmeyecektir.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
              Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.
            </p>
          </div>
        </body>
      </html>
    `,
    // Plain text versiyonu (HTML desteklemeyen email client'lar için)
    text: `
Şifre Sıfırlama

Merhaba,

Şifrenizi sıfırlamak için aşağıdaki linke tıklayın. Bu link 1 saat geçerlidir.

${resetUrl}

Eğer bu talebi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz. Şifreniz değişmeyecektir.

Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Şifre sıfırlama emaili gönderildi: ${email}`);
  } catch (error) {
    console.error("Email gönderme hatası:", error);
    throw new Error("Email gönderilemedi. Lütfen daha sonra tekrar deneyin.");
  }
};

/**
 * Email servisinin çalışıp çalışmadığını test et
 */
export const testEmailConnection = async (): Promise<boolean> => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return false;
    }

    const transporter = createTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error("Email bağlantı testi başarısız:", error);
    return false;
  }
};
