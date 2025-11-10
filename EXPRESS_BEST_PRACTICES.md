# Express.js Best Practices - Türkçe Rehber

## 📚 İçindekiler

1. [Route vs Controller Ayrımı](#route-vs-controller-ayrımı)
2. [Error Handling Stratejileri](#error-handling-stratejileri)
3. [Async/Await Kullanımı](#asyncawait-kullanımı)
4. [Middleware Yapısı](#middleware-yapısı)
5. [Kod Organizasyonu](#kod-organizasyonu)

---

## 🎯 Route vs Controller Ayrımı

### ❌ YANLIŞ: Her şeyi route içinde yazmak

```typescript
// routes/flashcard.routes.ts - YANLIŞ!
router.post("/", async (req, res) => {
  try {
    const flashcard = new Flashcard(req.body);
    await flashcard.save();
    res.json(flashcard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Neden yanlış?**

- Route dosyaları çok uzar
- Test etmesi zor
- Kod tekrarı artar
- Business logic route'lara karışır

### ✅ DOĞRU: Route sadece endpoint tanımlar, logic controller'da

```typescript
// routes/flashcard.routes.ts - DOĞRU ✅
router.post("/", createFlashcard);

// controllers/flashcard.controller.ts - DOĞRU ✅
export const createFlashcard = async (req, res, next) => {
  // Business logic burada
};
```

**Neden doğru?**

- ✅ Separation of Concerns (Ayrım Prensibi)
- ✅ Kod tekrarı azalır
- ✅ Test edilebilirlik artar
- ✅ Bakım kolaylaşır

---

## 🛡️ Error Handling Stratejileri

### Strateji 1: Try-Catch + next() (Manuel)

```typescript
export const createFlashcard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const flashcard = await Flashcard.create(req.body);
    res.status(201).json(success(flashcard));
  } catch (error: any) {
    next(error); // Error handler'a gönder
  }
};
```

**ÖNEMLİ:** `next(error)` çağrıldıktan sonra `res.json()` çağrılmamalı!

### Strateji 2: Async Wrapper (Önerilen - Daha Temiz)

```typescript
// middleware/asyncHandler.ts
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Kullanım:
export const createFlashcard = asyncHandler(async (req, res) => {
  const flashcard = await Flashcard.create(req.body);
  res.status(201).json(success(flashcard));
  // Try-catch'e gerek yok! Otomatik handle edilir
});
```

**Avantajları:**

- ✅ Try-catch tekrarı yok
- ✅ Daha temiz kod
- ✅ Tüm hatalar otomatik yakalanır

---

## 🔄 Async/Await Kullanımı

### ❌ YANLIŞ: Callback hell

```typescript
export const getFlashcard = (req, res) => {
  Flashcard.findById(req.params.id, (err, flashcard) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(flashcard);
    }
  });
};
```

### ✅ DOĞRU: Async/await

```typescript
export const getFlashcard = async (req, res, next) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id);
    if (!flashcard) {
      return res.status(404).json(notFound());
    }
    res.status(200).json(success(flashcard));
  } catch (error) {
    next(error);
  }
};
```

---

## 🎛️ Middleware Yapısı

### Middleware Sırası (ÖNEMLİ!)

```typescript
// server.ts
app.use(cors()); // 1. CORS
app.use(express.json()); // 2. Body parser
app.use(express.urlencoded()); // 3. URL encoded parser

app.use("/api/flashcards", routes); // 4. Routes

app.use(errorHandler); // 5. Error handler (EN SON!)
```

**Kural:** Error handler middleware **HER ZAMAN EN SONDA** olmalı!

---

## 📁 Kod Organizasyonu

### Önerilen Klasör Yapısı

```
src/
├── config/          # Veritabanı, environment config
├── controllers/     # Business logic (route handler'lar)
├── middleware/      # Custom middleware'ler
├── models/          # Mongoose modelleri
├── routes/          # Sadece route tanımlamaları
├── types/           # TypeScript type tanımları
├── utils/           # Yardımcı fonksiyonlar
└── server.ts        # Ana server dosyası
```

### Her Dosyanın Sorumluluğu

| Dosya          | Sorumluluk                  | Örnek                            |
| -------------- | --------------------------- | -------------------------------- |
| `routes/`      | Sadece endpoint tanımları   | `router.get("/", controller)`    |
| `controllers/` | Business logic, veri işleme | `await Flashcard.find()`         |
| `models/`      | Veritabanı şemaları         | `mongoose.Schema()`              |
| `middleware/`  | Request/Response işleme     | Auth, validation, error handling |
| `utils/`       | Yardımcı fonksiyonlar       | Response helpers, validators     |

---

## 🎨 Response Helper Kullanımı

### Tutarlı Response Formatı

```typescript
// utils/response.ts
export const success = (data: any, message = "OK") => ({
  success: true,
  message,
  data,
});

// Controller'da kullanım
res.status(201).json(success(flashcard, "Flashcard oluşturuldu"));
// Çıktı: { success: true, message: "Flashcard oluşturuldu", data: {...} }
```

**Avantaj:** Tüm API response'ları aynı formatta olur.

---

## ⚠️ Yaygın Hatalar ve Çözümleri

### Hata 1: next() sonrası response göndermek

```typescript
// ❌ YANLIŞ
catch (error) {
  res.status(500).json({ error: "Hata" });
  next(error); // Bu çalışmaz!
}

// ✅ DOĞRU
catch (error) {
  next(error); // Sadece next() çağır
}
```

### Hata 2: Error handler'ı route'lardan önce koymak

```typescript
// ❌ YANLIŞ
app.use(errorHandler);
app.use("/api/flashcards", routes);

// ✅ DOĞRU
app.use("/api/flashcards", routes);
app.use(errorHandler); // EN SONDA!
```

### Hata 3: Tüm controller'larda next() kullanmamak

```typescript
// ❌ YANLIŞ - Bazılarında next yok
export const getAll = async (req, res) => { ... }
export const create = async (req, res, next) => { ... }

// ✅ DOĞRU - Hepsi tutarlı
export const getAll = async (req, res, next) => { ... }
export const create = async (req, res, next) => { ... }
```

---

## 🚀 Özet: En İyi Pratikler

1. ✅ **Route dosyaları sadece endpoint tanımları içermeli**
2. ✅ **Business logic controller'larda olmalı**
3. ✅ **Async wrapper kullan (try-catch tekrarını önler)**
4. ✅ **Error handler middleware EN SONDA olmalı**
5. ✅ **Tutarlı response formatı kullan**
6. ✅ **next(error) sonrası response gönderme**
7. ✅ **Tüm async controller'larda error handling olmalı**

---

## 📝 Örnek: Tam Çalışan Yapı

```typescript
// routes/flashcard.routes.ts
router.post("/", asyncHandler(createFlashcard));

// controllers/flashcard.controller.ts
export const createFlashcard = async (req: Request, res: Response) => {
  const flashcard = await Flashcard.create(req.body);
  res.status(201).json(success(flashcard));
  // Hata otomatik yakalanır ve error handler'a gider
};

// middleware/errorHandler.ts
export const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message,
  });
};
```
