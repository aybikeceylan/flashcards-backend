import dotenv from "dotenv";
import connectDB from "../config/db";
import Flashcard from "../models/flashcard.model";

dotenv.config();

/**
 * SEED SCRIPT - Veritabanı Tohumlama Script'i
 *
 * Bu script ne işe yarar?
 * - Veritabanını başlangıç verileriyle doldurur
 * - Test ve development için örnek veriler ekler
 * - Veritabanını temizleyip yeniden doldurur
 *
 * Ne zaman kullanılır?
 * - İlk kurulumda (boş veritabanına veri eklemek için)
 * - Test verileri eklemek için
 * - Development ortamında hızlı veri oluşturmak için
 *
 * Nasıl çalıştırılır?
 * npm run seed
 * veya
 * ts-node src/scripts/seed.ts
 */

const seedData = [
  { word: "tree", translation: "ağaç", example: "The tree is tall." },
  { word: "sun", translation: "güneş", example: "The sun is shining." },
  { word: "moon", translation: "ay", example: "The moon is beautiful." },
  { word: "water", translation: "su", example: "I drink water." },
  { word: "fire", translation: "ateş", example: "The fire is hot." },
  { word: "earth", translation: "dünya", example: "We live on earth." },
  { word: "star", translation: "yıldız", example: "Look at the star." },
  { word: "cloud", translation: "bulut", example: "The cloud is white." },
  { word: "rain", translation: "yağmur", example: "It's raining." },
  { word: "snow", translation: "kar", example: "It's snowing." },
];

const seed = async () => {
  try {
    console.log("🌱 Seed script başlatılıyor...");

    // Veritabanına bağlan
    await connectDB();

    // Mevcut verileri temizle (opsiyonel - dikkatli kullan!)
    console.log("🗑️  Mevcut flashcard'lar siliniyor...");
    await Flashcard.deleteMany({});

    // Yeni verileri ekle
    console.log("📝 Yeni flashcard'lar ekleniyor...");
    const flashcards = await Flashcard.insertMany(seedData);

    console.log(`✅ ${flashcards.length} adet flashcard başarıyla eklendi!`);
    console.log("🌱 Seed işlemi tamamlandı!");

    // İşlem tamamlandı, çıkış yap
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Seed hatası:", error.message);
    process.exit(1);
  }
};

// Script'i çalıştır
seed();
