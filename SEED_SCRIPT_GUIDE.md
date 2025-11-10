# 🌱 Seed Script Rehberi

## Seed Script Nedir?

**Seed script**, veritabanını başlangıç verileriyle doldurmak için kullanılan bir script'tir. "Tohumlama" anlamına gelir - boş bir veritabanına örnek veriler ekler.

---

## 🎯 Ne İşe Yarar?

### 1. **İlk Kurulum**

- Yeni bir projede boş veritabanına hızlıca örnek veriler ekler
- API'yi test etmek için veri sağlar

### 2. **Development Ortamı**

- Her geliştirme oturumunda hızlıca test verileri oluşturur
- Veritabanını sıfırlayıp temiz verilerle başlamanı sağlar

### 3. **Test Verileri**

- Frontend geliştirirken gerçekçi veriler gösterir
- API endpoint'lerini test ederken kullanılır

---

## 📝 Kod Açıklaması

```typescript
import dotenv from "dotenv";
import connectDB from "../config/db";
import Flashcard from "../models/flashcard.model";

dotenv.config(); // .env dosyasındaki değişkenleri yükle

const seed = async () => {
  // 1. Veritabanına bağlan
  await connectDB();

  // 2. Mevcut verileri temizle (opsiyonel)
  await Flashcard.deleteMany();

  // 3. Yeni verileri ekle
  await Flashcard.insertMany([
    { word: "tree", translation: "ağaç" },
    { word: "sun", translation: "güneş" },
    { word: "moon", translation: "ay" },
  ]);

  console.log("🌱 Seed data added");
  process.exit(0); // Script'i sonlandır
};

seed(); // Script'i çalıştır
```

### Adım Adım Açıklama:

1. **`dotenv.config()`**: `.env` dosyasındaki `MONGO_URI` gibi değişkenleri yükler
2. **`connectDB()`**: MongoDB'ye bağlanır
3. **`deleteMany()`**: Tüm mevcut flashcard'ları siler (temiz başlangıç için)
4. **`insertMany()`**: Birden fazla flashcard'ı tek seferde ekler
5. **`process.exit(0)`**: Script'i başarıyla sonlandırır

---

## 🚀 Nasıl Kullanılır?

### Yöntem 1: npm script ile (Önerilen)

```bash
npm run seed
```

### Yöntem 2: Doğrudan ts-node ile

```bash
ts-node src/scripts/seed.ts
```

### Yöntem 3: Build sonrası

```bash
npm run build
node dist/scripts/seed.js
```

---

## ⚠️ Önemli Notlar

### 1. **Production'da Dikkatli Kullan!**

```typescript
// ❌ YANLIŞ - Production'da tüm verileri silme!
await Flashcard.deleteMany(); // Tüm veriler silinir!

// ✅ DOĞRU - Sadece development'ta kullan
if (process.env.NODE_ENV === "development") {
  await Flashcard.deleteMany();
}
```

### 2. **process.exit() Kullan**

Seed script'leri normalde Express server gibi sürekli çalışmaz. İşlem bitince kapanmalı:

```typescript
// ✅ DOĞRU
process.exit(0); // Başarılı
process.exit(1); // Hata durumunda
```

### 3. **Hata Yönetimi**

```typescript
try {
  await connectDB();
  await Flashcard.insertMany(data);
  console.log("✅ Başarılı!");
  process.exit(0);
} catch (error) {
  console.error("❌ Hata:", error);
  process.exit(1); // Hata kodu ile çık
}
```

---

## 📊 Örnek Kullanım Senaryoları

### Senaryo 1: İlk Kurulum

```bash
# 1. Projeyi klonla
git clone ...

# 2. Bağımlılıkları yükle
npm install

# 3. .env dosyasını oluştur
MONGO_URI=mongodb://localhost:27017/flashcards

# 4. Seed script'i çalıştır
npm run seed

# ✅ Veritabanı hazır!
```

### Senaryo 2: Test Verileri Ekleme

```typescript
// seed.ts içinde
const seedData = [
  { word: "hello", translation: "merhaba" },
  { word: "goodbye", translation: "güle güle" },
  // ... daha fazla veri
];

await Flashcard.insertMany(seedData);
```

### Senaryo 3: Koşullu Seed

```typescript
const seed = async () => {
  await connectDB();

  // Sadece boşsa ekle
  const count = await Flashcard.countDocuments();
  if (count === 0) {
    await Flashcard.insertMany(seedData);
    console.log("✅ Veriler eklendi");
  } else {
    console.log("⚠️  Veritabanında zaten veri var");
  }

  process.exit(0);
};
```

---

## 🔄 Seed vs Migration

| Özellik               | Seed Script                    | Migration                      |
| --------------------- | ------------------------------ | ------------------------------ |
| **Amaç**              | Örnek veri ekleme              | Veritabanı şeması değişikliği  |
| **Kullanım**          | Development/Test               | Production                     |
| **Tekrar Çalıştırma** | Evet (verileri değiştirebilir) | Hayır (idempotent olmalı)      |
| **Örnek**             | `insertMany([...])`            | `createIndex()`, `addColumn()` |

---

## 🎨 Gelişmiş Örnekler

### Örnek 1: Büyük Veri Seti

```typescript
import fs from "fs";
import path from "path";

const seed = async () => {
  await connectDB();

  // JSON dosyasından veri oku
  const dataPath = path.join(__dirname, "../data/flashcards.json");
  const seedData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  await Flashcard.insertMany(seedData);
  process.exit(0);
};
```

### Örnek 2: Faker ile Rastgele Veri

```typescript
import { faker } from "@faker-js/faker";

const seedData = Array.from({ length: 100 }, () => ({
  word: faker.word.noun(),
  translation: faker.lorem.word(),
  example: faker.lorem.sentence(),
}));

await Flashcard.insertMany(seedData);
```

---

## ✅ Özet

- ✅ Seed script = Veritabanına örnek veri ekleme
- ✅ Development ve test için kullanılır
- ✅ `deleteMany()` + `insertMany()` kombinasyonu yaygındır
- ✅ `process.exit()` ile script'i sonlandır
- ✅ Production'da dikkatli kullan!

---

## 📚 İlgili Dosyalar

- `src/scripts/seed.ts` - Seed script dosyası
- `src/config/db.ts` - Veritabanı bağlantısı
- `src/models/flashcard.model.ts` - Flashcard modeli
