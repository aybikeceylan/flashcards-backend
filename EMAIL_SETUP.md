# Email Konfigürasyonu Rehberi

## Gmail ile Email Gönderme

Gmail ile email göndermek için **App Password** kullanmanız gerekiyor. Normal Gmail şifreniz çalışmaz.

### Adım 1: 2-Step Verification'ı Açın

1. [Google Account](https://myaccount.google.com/) sayfasına gidin
2. **Security** (Güvenlik) sekmesine tıklayın
3. **2-Step Verification** (2 Adımlı Doğrulama) bölümünü bulun
4. Eğer kapalıysa, açın ve kurulumu tamamlayın

### Adım 2: App Password Oluşturun

1. **Security** sayfasında **App passwords** (Uygulama şifreleri) bölümüne gidin
   - Eğer göremiyorsanız, 2-Step Verification'ın açık olduğundan emin olun
2. **Select app** (Uygulama seçin) dropdown'ından **Mail** seçin
3. **Select device** (Cihaz seçin) dropdown'ından **Other (Custom name)** seçin
4. İsim olarak "Flashcards Backend" yazın
5. **Generate** (Oluştur) butonuna tıklayın
6. **16 karakterli şifreyi kopyalayın** (örnek: `abcd efgh ijkl mnop`)

### Adım 3: .env Dosyasını Güncelleyin

Proje kök dizinindeki `.env` dosyanıza şunları ekleyin:

```env
# Email Konfigürasyonu
EMAIL_USER=yourname@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  # App Password (boşluksuz)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM_NAME=Flashcards App
FRONTEND_URL=http://localhost:3000
```

**Önemli:**

- `EMAIL_USER`: Gmail adresiniz (örn: `aybikesayar@gmail.com`)
- `EMAIL_PASSWORD`: App Password (16 karakter, boşluksuz)
- `EMAIL_FROM_NAME`: Email'de görünecek gönderen adı (opsiyonel)

### Adım 4: Server'ı Yeniden Başlatın

```bash
npm run dev
```

## Test Etme

Email göndermeyi test etmek için:

1. `POST /api/auth/forgot-password` endpoint'ini çağırın
2. Email adresinizi gönderin
3. Console'da email gönderildi mesajını görmelisiniz
4. Email'inizi kontrol edin

## Sorun Giderme

### "Invalid login" veya "BadCredentials" Hatası

- App Password'ü doğru kopyaladığınızdan emin olun (boşluksuz)
- 2-Step Verification'ın açık olduğundan emin olun
- Normal Gmail şifrenizi kullanmayın, mutlaka App Password kullanın

### Email Gönderilmiyor

- `.env` dosyasının doğru konumda olduğundan emin olun
- Environment variable'ların doğru yüklendiğini kontrol edin
- Server'ı yeniden başlatın

## Alternatif Email Servisleri

Gmail yerine başka servisler de kullanabilirsiniz:

### SendGrid

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
```

### AWS SES

```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your_access_key
EMAIL_PASSWORD=your_secret_key
```

### Outlook/Hotmail

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
```
