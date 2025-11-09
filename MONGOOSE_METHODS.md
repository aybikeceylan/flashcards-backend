# Mongoose Model Metotları - Kapsamlı Liste

## 📚 İÇİNDEKİLER

1. [Okuma Metotları (Read/Query)](#1-okuma-metotları-readquery)
2. [Yazma Metotları (Create)](#2-yazma-metotları-create)
3. [Güncelleme Metotları (Update)](#3-güncelleme-metotları-update)
4. [Silme Metotları (Delete)](#4-silme-metotları-delete)
5. [Sayma ve Kontrol Metotları](#5-sayma-ve-kontrol-metotları)
6. [Zincirleme Metotlar (Query Chain)](#6-zincirleme-metotlar-query-chain)
7. [Instance Metotları](#7-instance-metotları)

---

## 1. OKUMA METOTLARI (Read/Query)

### ✅ Temel Okuma Metotları

#### `find(filter, projection, options)`

```typescript
// Tüm kayıtları getir
await Flashcard.find();

// Filtre ile getir
await Flashcard.find({ word: "hello" });

// Belirli alanları getir
await Flashcard.find({}, "word translation");

// Seçenekler ile
await Flashcard.find({}, null, { limit: 10 });
```

#### `findById(id, projection, options)`

```typescript
// ID'ye göre getir
await Flashcard.findById("123");

// Sadece belirli alanları getir
await Flashcard.findById("123", "word translation");
```

#### `findOne(filter, projection, options)`

```typescript
// Koşula göre tek kayıt getir
await Flashcard.findOne({ word: "hello" });

// İlk eşleşeni getir
await Flashcard.findOne({ translation: { $exists: true } });
```

#### `findByIdAndDelete(id, options)`

```typescript
// ID'ye göre bul ve sil
await Flashcard.findByIdAndDelete("123");

// Seçenekler ile
await Flashcard.findByIdAndDelete("123", {
  select: "word",
});
```

#### `findByIdAndRemove(id, options)`

```typescript
// findByIdAndDelete ile aynı (eski versiyon)
await Flashcard.findByIdAndRemove("123");
```

#### `findByIdAndUpdate(id, update, options)`

```typescript
// ID'ye göre bul ve güncelle
await Flashcard.findByIdAndUpdate(
  "123",
  { word: "hi" },
  { new: true } // Güncellenmiş versiyonu döndür
);
```

#### `findOneAndDelete(filter, options)`

```typescript
// Koşula göre bul ve sil
await Flashcard.findOneAndDelete({ word: "hello" });
```

#### `findOneAndRemove(filter, options)`

```typescript
// findOneAndDelete ile aynı (eski versiyon)
await Flashcard.findOneAndRemove({ word: "hello" });
```

#### `findOneAndReplace(filter, replacement, options)`

```typescript
// Koşula göre bul ve değiştir
await Flashcard.findOneAndReplace(
  { word: "hello" },
  { word: "hi", translation: "selam" },
  { new: true }
);
```

#### `findOneAndUpdate(filter, update, options)`

```typescript
// Koşula göre bul ve güncelle
await Flashcard.findOneAndUpdate(
  { word: "hello" },
  { translation: "merhaba" },
  { new: true, runValidators: true }
);
```

---

## 2. YAZMA METOTLARI (Create)

### ✅ Yeni Kayıt Oluşturma

#### `create(docs)` - Çoklu kayıt

```typescript
// Tek kayıt
await Flashcard.create({ word: "hello", translation: "merhaba" });

// Çoklu kayıt
await Flashcard.create([
  { word: "hello", translation: "merhaba" },
  { word: "world", translation: "dünya" },
]);
```

#### `new Model()` + `save()` - Tek kayıt

```typescript
// Yeni instance oluştur
const flashcard = new Flashcard({
  word: "hello",
  translation: "merhaba",
});

// Veritabanına kaydet
await flashcard.save();
```

#### `insertMany(docs, options)`

```typescript
// Çoklu kayıt ekle
await Flashcard.insertMany([{ word: "hello" }, { word: "world" }], {
  ordered: false,
}); // Hata olsa bile devam et
```

---

## 3. GÜNCELLEME METOTLARI (Update)

### ✅ Güncelleme İşlemleri

#### `updateOne(filter, update, options)`

```typescript
// Tek kayıt güncelle (sonuç döndürmez)
await Flashcard.updateOne(
  { _id: "123" },
  { word: "hi" },
  { runValidators: true }
);

// Sonucu kontrol et
const result = await Flashcard.updateOne({ _id: "123" }, { word: "hi" });
console.log(result.matchedCount); // Eşleşen kayıt sayısı
console.log(result.modifiedCount); // Güncellenen kayıt sayısı
```

#### `updateMany(filter, update, options)`

```typescript
// Çoklu kayıt güncelle
await Flashcard.updateMany(
  { word: { $exists: false } },
  { word: "unknown" },
  { runValidators: true }
);
```

#### `replaceOne(filter, replacement, options)`

```typescript
// Kaydı tamamen değiştir
await Flashcard.replaceOne(
  { _id: "123" },
  { word: "hi", translation: "selam" }
);
```

---

## 4. SİLME METOTLARI (Delete)

### ✅ Silme İşlemleri

#### `deleteOne(filter, options)`

```typescript
// Tek kayıt sil (sonuç döndürmez)
await Flashcard.deleteOne({ _id: "123" });

// Sonucu kontrol et
const result = await Flashcard.deleteOne({ _id: "123" });
console.log(result.deletedCount); // Silinen kayıt sayısı
```

#### `deleteMany(filter, options)`

```typescript
// Çoklu kayıt sil
await Flashcard.deleteMany({ word: "hello" });

// Tümünü sil (dikkatli kullan!)
await Flashcard.deleteMany({});
```

#### `findByIdAndDelete(id, options)`

```typescript
// ID'ye göre bul ve sil (silinen kaydı döndürür)
const deleted = await Flashcard.findByIdAndDelete("123");
```

#### `findOneAndDelete(filter, options)`

```typescript
// Koşula göre bul ve sil (silinen kaydı döndürür)
const deleted = await Flashcard.findOneAndDelete({ word: "hello" });
```

---

## 5. SAYMA VE KONTROL METOTLARI

### ✅ Sayma ve Varlık Kontrolü

#### `countDocuments(filter, options)`

```typescript
// Toplam kayıt sayısı
const total = await Flashcard.countDocuments();

// Filtre ile say
const count = await Flashcard.countDocuments({ word: "hello" });
```

#### `estimatedDocumentCount(options)`

```typescript
// Tahmini kayıt sayısı (daha hızlı, ama tam değil)
const estimated = await Flashcard.estimatedDocumentCount();
```

#### `exists(filter)`

```typescript
// Kayıt var mı kontrol et
const exists = await Flashcard.exists({ word: "hello" });
// Döner: { _id: "123" } veya null
```

#### `distinct(field, filter)`

```typescript
// Benzersiz değerleri getir
const uniqueWords = await Flashcard.distinct("word");

// Filtre ile
const unique = await Flashcard.distinct("word", {
  translation: { $exists: true },
});
```

---

## 6. ZİNCİRLEME METOTLAR (Query Chain)

### ✅ Query Builder Metotları

#### `.limit(number)`

```typescript
// Belirli sayıda kayıt getir
await Flashcard.find().limit(10);
```

#### `.skip(number)`

```typescript
// Belirli sayıda kayıt atla (sayfalama için)
await Flashcard.find().skip(10).limit(10); // 11-20 arası
```

#### `.sort(sortObject)`

```typescript
// Sırala
await Flashcard.find().sort({ createdAt: -1 }); // Azalan
await Flashcard.find().sort({ word: 1 }); // Artan
await Flashcard.find().sort("word -createdAt"); // Çoklu sıralama
```

#### `.select(fields)`

```typescript
// Sadece belirli alanları getir
await Flashcard.find().select("word translation");
await Flashcard.find().select("-createdAt"); // createdAt hariç
await Flashcard.find().select("word translation -_id"); // _id hariç
```

#### `.populate(path, select)`

```typescript
// İlişkili verileri getir (referans varsa)
await Flashcard.find().populate("category");
await Flashcard.find().populate("category", "name");
```

#### `.lean()`

```typescript
// Mongoose document yerine plain JavaScript object döndür (daha hızlı)
await Flashcard.find().lean();
```

#### `.exec()`

```typescript
// Promise döndürür (opsiyonel, await zaten yeterli)
await Flashcard.find().exec();
```

#### `.then()` / `.catch()`

```typescript
// Promise chain
Flashcard.find()
  .then((flashcards) => console.log(flashcards))
  .catch((error) => console.error(error));
```

#### `.where(path)`

```typescript
// Koşul ekle
await Flashcard.find().where("word").equals("hello");
await Flashcard.find().where("createdAt").gt(new Date("2024-01-01"));
```

#### `.or(array)`

```typescript
// VEYA koşulu
await Flashcard.find().or([{ word: "hello" }, { translation: "merhaba" }]);
```

#### `.and(array)`

```typescript
// VE koşulu
await Flashcard.find().and([
  { word: "hello" },
  { translation: { $exists: true } },
]);
```

#### `.nor(array)`

```typescript
// NE koşulu (hiçbiri olmasın)
await Flashcard.find().nor([{ word: "hello" }, { word: "world" }]);
```

---

## 7. INSTANCE METOTLARI

### ✅ Kayıt Üzerinde İşlemler

#### `.save()`

```typescript
// Değişiklikleri kaydet
const flashcard = await Flashcard.findById("123");
flashcard.word = "hi";
await flashcard.save();
```

#### `.remove()` / `.deleteOne()`

```typescript
// Kaydı sil
const flashcard = await Flashcard.findById("123");
await flashcard.remove(); // veya
await flashcard.deleteOne();
```

#### `.updateOne(update, options)`

```typescript
// Kaydı güncelle
const flashcard = await Flashcard.findById("123");
await flashcard.updateOne({ word: "hi" });
```

#### `.toJSON()`

```typescript
// JSON formatına çevir
const flashcard = await Flashcard.findById("123");
const json = flashcard.toJSON();
```

#### `.toObject()`

```typescript
// Plain object'e çevir
const flashcard = await Flashcard.findById("123");
const obj = flashcard.toObject();
```

#### `.isNew`

```typescript
// Yeni kayıt mı kontrol et
const flashcard = new Flashcard({ word: "hello" });
console.log(flashcard.isNew); // true
await flashcard.save();
console.log(flashcard.isNew); // false
```

#### `.isModified(path)`

```typescript
// Alan değişti mi kontrol et
const flashcard = await Flashcard.findById("123");
flashcard.word = "hi";
console.log(flashcard.isModified("word")); // true
console.log(flashcard.isModified("translation")); // false
```

---

## 8. ÖZEL METOTLAR

### ✅ Diğer Kullanışlı Metotlar

#### `aggregate(pipeline)`

```typescript
// Aggregation pipeline (karmaşık sorgular)
await Flashcard.aggregate([
  { $match: { word: "hello" } },
  { $group: { _id: "$word", count: { $sum: 1 } } },
]);
```

#### `bulkWrite(operations, options)`

```typescript
// Toplu işlemler
await Flashcard.bulkWrite([
  { insertOne: { document: { word: "hello" } } },
  { updateOne: { filter: { _id: "123" }, update: { word: "hi" } } },
  { deleteOne: { filter: { _id: "456" } } },
]);
```

#### `watch(pipeline, options)`

```typescript
// Change Stream (değişiklikleri izle)
const changeStream = Flashcard.watch();
changeStream.on("change", (change) => {
  console.log(change);
});
```

---

## 📊 METOT KARŞILAŞTIRMA TABLOSU

| İşlem          | Tek Kayıt                            | Çoklu Kayıt    | Sonuç Döndürür |
| -------------- | ------------------------------------ | -------------- | -------------- |
| **Okuma**      | `findById()`, `findOne()`            | `find()`       | ✅ Evet        |
| **Yazma**      | `create()`, `save()`                 | `insertMany()` | ✅ Evet        |
| **Güncelleme** | `updateOne()`, `findByIdAndUpdate()` | `updateMany()` | ❌/✅          |
| **Silme**      | `deleteOne()`, `findByIdAndDelete()` | `deleteMany()` | ❌/✅          |

---

## 🎯 EN ÇOK KULLANILAN METOTLAR

### Top 10 Metot:

1. `find()` - Tüm kayıtları getir
2. `findById()` - ID'ye göre getir
3. `findOne()` - Koşula göre getir
4. `create()` - Yeni kayıt oluştur
5. `save()` - Kaydet
6. `findByIdAndUpdate()` - Bul ve güncelle
7. `findByIdAndDelete()` - Bul ve sil
8. `updateOne()` - Güncelle
9. `deleteOne()` - Sil
10. `countDocuments()` - Say

---

## 💡 İPUÇLARI

### 1. `new: true` Seçeneği

```typescript
// Güncellenmiş versiyonu döndür
await Flashcard.findByIdAndUpdate(id, update, { new: true });
```

### 2. `runValidators: true` Seçeneği

```typescript
// Model validasyonlarını çalıştır
await Flashcard.updateOne(filter, update, { runValidators: true });
```

### 3. `lean()` Performans

```typescript
// Daha hızlı (Mongoose document yerine plain object)
await Flashcard.find().lean();
```

### 4. Zincirleme Kullanımı

```typescript
// Birden fazla metodu zincirle
await Flashcard.find()
  .where("word")
  .equals("hello")
  .select("word translation")
  .sort({ createdAt: -1 })
  .limit(10)
  .lean();
```

---

## 📝 ÖRNEK KULLANIMLAR

### Sayfalama (Pagination)

```typescript
const page = 1;
const limit = 10;
const skip = (page - 1) * limit;

const flashcards = await Flashcard.find()
  .skip(skip)
  .limit(limit)
  .sort({ createdAt: -1 });

const total = await Flashcard.countDocuments();
```

### Arama (Search)

```typescript
const searchTerm = "hello";
const flashcards = await Flashcard.find({
  $or: [
    { word: { $regex: searchTerm, $options: "i" } },
    { translation: { $regex: searchTerm, $options: "i" } },
  ],
});
```

### Filtreleme ve Sıralama

```typescript
const flashcards = await Flashcard.find({
  translation: { $exists: true },
  createdAt: { $gte: new Date("2024-01-01") },
})
  .select("word translation")
  .sort({ word: 1 })
  .limit(20);
```

---

Bu liste Mongoose'un en önemli metotlarını kapsar. Pratik yaparak öğrenmek en iyisidir! 🚀
