import { Request, Response } from "express";
import Flashcard from "../models/flashcard.model";
import { badRequest, notFound, success, failure } from "../utils/response";
import {
  fetchWordFromDictionary,
  getGoogleSuggestions,
} from "../utils/dictionary";

/**
 * BEST PRACTICE: Controller fonksiyonları asyncHandler ile sarmalanır
 * Bu sayede try-catch tekrarı olmaz ve hatalar otomatik error handler'a gider
 *
 * NOT: next parametresi artık gerekli değil çünkü asyncHandler hataları yakalar
 */

// Get all flashcards
export const getAllFlashcards = async (
  req: Request,
  res: Response
): Promise<void> => {
  const flashcards = await Flashcard.find().sort({ createdAt: -1 });
  res
    .status(200)
    .json(success(flashcards, "Flashcard'lar başarıyla getirildi"));
};

// Get single flashcard
export const getFlashcardById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const flashcard = await Flashcard.findById(req.params.id);

  if (!flashcard) {
    res.status(404).json(notFound("Flashcard bulunamadı"));
    return;
  }

  res.status(200).json(success(flashcard));
};

// Create flashcard
export const createFlashcard = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { word, translation, meaning, example, imageUrl, audioUrl } = req.body;

  // Validation
  if (!word) {
    res.status(400).json(badRequest("Word alanı zorunludur"));
    return;
  }

  // Eğer dosya yüklendiyse, dosya URL'lerini kullan
  let finalImageUrl = imageUrl;
  let finalAudioUrl = audioUrl;

  // Multipart form data'dan gelen dosyaları kontrol et
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  if (files) {
    // Image dosyası varsa
    if (files.image && files.image[0]) {
      finalImageUrl = `/uploads/images/${files.image[0].filename}`;
    }
    // Audio dosyası varsa
    if (files.audio && files.audio[0]) {
      finalAudioUrl = `/uploads/audio/${files.audio[0].filename}`;
    }
  }

  // Tek dosya olarak da kontrol et (single upload)
  const imageFile = req.file as Express.Multer.File | undefined;
  if (imageFile && imageFile.fieldname === "image") {
    finalImageUrl = `/uploads/images/${imageFile.filename}`;
  }

  // Dictionary API'den otomatik veri çek (eğer translation veya example yoksa)
  let enrichedData: any = {};
  const shouldFetchFromDictionary = !translation || !example;

  if (shouldFetchFromDictionary) {
    try {
      const dictionaryData = await fetchWordFromDictionary(word);

      if (dictionaryData) {
        // İlk anlamı meaning olarak kullan (İngilizce açıklama)
        if (!meaning && dictionaryData.meanings.length > 0) {
          const firstDefinition =
            dictionaryData.meanings[0]?.definitions[0]?.definition;
          if (firstDefinition) {
            enrichedData.meaning = firstDefinition;
          }
        }

        // İlk anlamı translation olarak da kullan (eğer translation yoksa)
        if (!translation && dictionaryData.meanings.length > 0) {
          const firstDefinition =
            dictionaryData.meanings[0]?.definitions[0]?.definition;
          if (firstDefinition) {
            enrichedData.translation = firstDefinition;
          }
        }

        // İlk örnek cümleyi kullan
        if (!example) {
          const firstExample =
            dictionaryData.meanings[0]?.definitions[0]?.example ||
            dictionaryData.exampleSentences?.[0];
          if (firstExample) {
            enrichedData.example = firstExample;
          }
        }

        // Phonetic ve pronunciation bilgilerini ekle
        if (dictionaryData.phonetic) {
          enrichedData.phonetic = dictionaryData.phonetic;
        }

        if (dictionaryData.pronunciation) {
          enrichedData.pronunciation = dictionaryData.pronunciation;
          // Eğer audioUrl yoksa, pronunciation'ı audioUrl olarak kullan
          if (!finalAudioUrl) {
            enrichedData.audioUrl = dictionaryData.pronunciation;
          }
        }

        // Part of speech bilgisini ekle
        if (dictionaryData.meanings[0]?.partOfSpeech) {
          enrichedData.partOfSpeech = dictionaryData.meanings[0].partOfSpeech;
        }
      }
    } catch (error: any) {
      // Dictionary API hatası olsa bile flashcard oluşturulmaya devam eder
      console.error("Dictionary API hatası:", error.message);
    }
  }

  const flashcard = new Flashcard({
    word,
    translation: translation || enrichedData.translation,
    meaning: meaning || enrichedData.meaning,
    example: example || enrichedData.example,
    imageUrl: finalImageUrl,
    audioUrl: finalAudioUrl || enrichedData.audioUrl,
    phonetic: enrichedData.phonetic,
    pronunciation: enrichedData.pronunciation,
    partOfSpeech: enrichedData.partOfSpeech,
  });

  const savedFlashcard = await flashcard.save();
  res
    .status(201)
    .json(success(savedFlashcard, "Flashcard başarıyla oluşturuldu"));
};

// Update flashcard
export const updateFlashcard = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { word, translation, meaning, example, imageUrl, audioUrl } = req.body;

  // Mevcut flashcard'ı getir
  const existingFlashcard = await Flashcard.findById(req.params.id);
  if (!existingFlashcard) {
    res.status(404).json(notFound("Flashcard bulunamadı"));
    return;
  }

  // Eğer dosya yüklendiyse, dosya URL'lerini kullan
  let finalImageUrl =
    imageUrl !== undefined ? imageUrl : existingFlashcard.imageUrl;
  let finalAudioUrl =
    audioUrl !== undefined ? audioUrl : existingFlashcard.audioUrl;

  // Multipart form data'dan gelen dosyaları kontrol et
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  if (files) {
    // Image dosyası varsa
    if (files.image && files.image[0]) {
      finalImageUrl = `/uploads/images/${files.image[0].filename}`;
    }
    // Audio dosyası varsa
    if (files.audio && files.audio[0]) {
      finalAudioUrl = `/uploads/audio/${files.audio[0].filename}`;
    }
  }

  // Tek dosya olarak da kontrol et (single upload)
  const imageFile = req.file as Express.Multer.File | undefined;
  if (imageFile && imageFile.fieldname === "image") {
    finalImageUrl = `/uploads/images/${imageFile.filename}`;
  }

  const updateData: any = {};
  if (word !== undefined) updateData.word = word;
  if (translation !== undefined) updateData.translation = translation;
  if (meaning !== undefined) updateData.meaning = meaning;
  if (example !== undefined) updateData.example = example;
  if (finalImageUrl !== undefined) updateData.imageUrl = finalImageUrl;
  if (finalAudioUrl !== undefined) updateData.audioUrl = finalAudioUrl;

  const flashcard = await Flashcard.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!flashcard) {
    res.status(404).json(notFound("Flashcard bulunamadı"));
    return;
  }

  res.status(200).json(success(flashcard, "Flashcard başarıyla güncellendi"));
};

// Delete flashcard
export const deleteFlashcard = async (
  req: Request,
  res: Response
): Promise<void> => {
  const flashcard = await Flashcard.findByIdAndDelete(req.params.id);

  if (!flashcard) {
    res.status(404).json(notFound("Flashcard bulunamadı"));
    return;
  }

  res.status(200).json(success(flashcard, "Flashcard başarıyla silindi"));
};

// ========== OLMAYAN METOTLAR - ÖRNEKLER ==========

// 1. findOne() - Koşula göre tek kayıt getir
export const getFlashcardByWord = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { word } = req.query;
    const flashcard = await Flashcard.findOne({ word: word });

    if (!flashcard) {
      res.status(404).json(failure("Flashcard bulunamadı"));
      return;
    }

    res.status(200).json(success(flashcard));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 2. countDocuments() - Toplam kayıt sayısı
export const getFlashcardCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const count = await Flashcard.countDocuments();
    res.status(200).json({ count });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 3. exists() - Kayıt var mı kontrol et
export const checkFlashcardExists = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { word } = req.query;
    const exists = await Flashcard.exists({ word: word });
    res.status(200).json({ exists: !!exists });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 4. find().limit() - Belirli sayıda kayıt getir
export const getFlashcardsWithLimit = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const flashcards = await Flashcard.find()
      .limit(limit)
      .sort({ createdAt: -1 });
    res.status(200).json(flashcards);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 5. find().skip() - Sayfalama (pagination)
export const getFlashcardsPaginated = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const flashcards = await Flashcard.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Flashcard.countDocuments();

    res.status(200).json({
      flashcards,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 6. find().select() - Sadece belirli alanları getir
export const getFlashcardsWordsOnly = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const flashcards = await Flashcard.find()
      .select("word translation") // Sadece word ve translation alanları
      .sort({ createdAt: -1 });
    res.status(200).json(flashcards);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 7. findOneAndUpdate() - Koşula göre güncelle
export const updateFlashcardByWord = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { word } = req.query;
    const updateData = req.body;

    const flashcard = await Flashcard.findOneAndUpdate(
      { word: word },
      updateData,
      { new: true, runValidators: true }
    );

    if (!flashcard) {
      res.status(404).json({ message: "Flashcard bulunamadı" });
      return;
    }

    res.status(200).json(flashcard);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 8. findOneAndDelete() - Koşula göre sil
export const deleteFlashcardByWord = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { word } = req.query;
    const flashcard = await Flashcard.findOneAndDelete({ word: word });

    if (!flashcard) {
      res.status(404).json({ message: "Flashcard bulunamadı" });
      return;
    }

    res.status(200).json({ message: "Flashcard başarıyla silindi" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 9. deleteOne() - Sil (sonucu döndürmez)
export const deleteFlashcardById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await Flashcard.deleteOne({ _id: req.params.id });

    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Flashcard bulunamadı" });
      return;
    }

    res.status(200).json({ message: "Flashcard başarıyla silindi" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 10. deleteMany() - Çoklu silme
export const deleteManyFlashcards = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { words } = req.body; // ["hello", "world"] gibi array
    const result = await Flashcard.deleteMany({ word: { $in: words } });

    res.status(200).json({
      message: `${result.deletedCount} flashcard silindi`,
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 11. updateOne() - Güncelle (sonucu döndürmez)
export const updateFlashcardById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await Flashcard.updateOne({ _id: req.params.id }, req.body, {
      runValidators: true,
    });

    if (result.matchedCount === 0) {
      res.status(404).json({ message: "Flashcard bulunamadı" });
      return;
    }

    // Güncellenmiş kaydı getir
    const flashcard = await Flashcard.findById(req.params.id);
    res.status(200).json(flashcard);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 12. updateMany() - Çoklu güncelleme
export const updateManyFlashcards = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { filter, update } = req.body;
    const result = await Flashcard.updateMany(filter, update, {
      runValidators: true,
    });

    res.status(200).json({
      message: `${result.modifiedCount} flashcard güncellendi`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 13. find() ile filtreleme - Koşullu arama
export const searchFlashcards = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { word, translation } = req.query;
    const filter: any = {};

    if (word) {
      filter.word = { $regex: word, $options: "i" }; // Büyük/küçük harf duyarsız
    }
    if (translation) {
      filter.translation = { $regex: translation, $options: "i" };
    }

    const flashcards = await Flashcard.find(filter).sort({ createdAt: -1 });
    res.status(200).json(flashcards);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get dictionary data for a word
export const getDictionaryData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { word } = req.query;

    if (!word || typeof word !== "string") {
      res.status(400).json(badRequest("Word parametresi zorunludur"));
      return;
    }

    const dictionaryData = await fetchWordFromDictionary(word);

    if (!dictionaryData) {
      res.status(404).json(notFound("Kelime bulunamadı veya sözlükte yok"));
      return;
    }

    res
      .status(200)
      .json(success(dictionaryData, "Sözlük verileri başarıyla getirildi"));
  } catch (error: any) {
    res.status(500).json(failure(error.message));
  }
};

// Get word suggestions (autocomplete)
export const getWordSuggestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { q, limit = "10" } = req.query;

    if (!q || typeof q !== "string" || q.length < 2) {
      res
        .status(400)
        .json(
          badRequest(
            "Query parametresi zorunludur ve en az 2 karakter olmalıdır"
          )
        );
      return;
    }

    const limitNum = parseInt(limit as string) || 10;
    const query = q.toLowerCase().trim();

    // 1. Veritabanından benzer kelimeleri çek (kullanıcının kendi kelimeleri)
    const dbSuggestions = await Flashcard.find({
      word: { $regex: `^${query}`, $options: "i" }, // Başlayan kelimeler
    })
      .select("word")
      .limit(limitNum)
      .sort({ word: 1 })
      .lean();

    const dbWords = dbSuggestions.map((f) => f.word);

    // 2. Google Suggestions'dan öneriler çek
    let googleSuggestions: string[] = [];
    try {
      googleSuggestions = await getGoogleSuggestions(query);
    } catch (error: any) {
      console.error("Google suggestions hatası:", error.message);
    }

    // 3. Önerileri birleştir ve sırala
    // Önce veritabanındaki kelimeler, sonra Google önerileri
    const allSuggestions = [
      ...dbWords,
      ...googleSuggestions.filter(
        (word) => !dbWords.includes(word.toLowerCase())
      ),
    ];

    // Tekrarları kaldır ve limit'e göre kes
    const uniqueSuggestions = Array.from(
      new Set(allSuggestions.map((w) => w.toLowerCase()))
    )
      .slice(0, limitNum)
      .map((w) => {
        // Orijinal case'i koru (veritabanından gelen)
        const dbMatch = dbWords.find((dbw) => dbw.toLowerCase() === w);
        return dbMatch || w;
      });

    res.status(200).json(
      success(
        {
          suggestions: uniqueSuggestions,
          count: uniqueSuggestions.length,
          source: {
            database: dbWords.length,
            google: googleSuggestions.length,
          },
        },
        "Kelime önerileri başarıyla getirildi"
      )
    );
  } catch (error: any) {
    res.status(500).json(failure(error.message));
  }
};
