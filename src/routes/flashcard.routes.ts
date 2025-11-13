import express, { Router } from "express";
import {
  getAllFlashcards,
  getFlashcardById,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  getDictionaryData,
  getWordSuggestions,
} from "../controllers/flashcard.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { uploadFiles } from "../config/multer";

const router: Router = express.Router();

/**
 * BEST PRACTICE: Controller fonksiyonları asyncHandler ile sarmalanır
 * Bu sayede hatalar otomatik olarak error handler middleware'ine yönlendirilir
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Flashcard:
 *       type: object
 *       required:
 *         - word
 *       properties:
 *         _id:
 *           type: string
 *           description: Flashcard'ın benzersiz ID'si
 *           example: 507f1f77bcf86cd799439011
 *         word:
 *           type: string
 *           description: Kelime
 *           example: "hello"
 *         translation:
 *           type: string
 *           description: Çeviri
 *           example: "merhaba"
 *         example:
 *           type: string
 *           description: Örnek cümle
 *           example: "Hello, how are you?"
 *         imageUrl:
 *           type: string
 *           description: Görsel URL'i
 *           example: "https://example.com/image.jpg"
 *         audioUrl:
 *           type: string
 *           description: Ses dosyası URL'i
 *           example: "https://example.com/audio.mp3"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Oluşturulma tarihi
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Güncellenme tarihi
 *     CreateFlashcard:
 *       type: object
 *       required:
 *         - word
 *       properties:
 *         word:
 *           type: string
 *           description: Kelime
 *           example: "hello"
 *         translation:
 *           type: string
 *           description: Çeviri
 *           example: "merhaba"
 *         example:
 *           type: string
 *           description: Örnek cümle
 *           example: "Hello, how are you?"
 *         imageUrl:
 *           type: string
 *           description: Görsel URL'i
 *           example: "https://example.com/image.jpg"
 *         audioUrl:
 *           type: string
 *           description: Ses dosyası URL'i
 *           example: "https://example.com/audio.mp3"
 *     UpdateFlashcard:
 *       type: object
 *       properties:
 *         word:
 *           type: string
 *           description: Kelime
 *           example: "hello"
 *         translation:
 *           type: string
 *           description: Çeviri
 *           example: "merhaba"
 *         example:
 *           type: string
 *           description: Örnek cümle
 *           example: "Hello, how are you?"
 *         imageUrl:
 *           type: string
 *           description: Görsel URL'i
 *           example: "https://example.com/image.jpg"
 *         audioUrl:
 *           type: string
 *           description: Ses dosyası URL'i
 *           example: "https://example.com/audio.mp3"
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *         message:
 *           type: string
 *           example: "İşlem başarılı"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Hata mesajı"
 */

/**
 * @swagger
 * /api/flashcards:
 *   get:
 *     summary: Tüm flashcard'ları getir
 *     tags: [Flashcards]
 *     responses:
 *       200:
 *         description: Flashcard'lar başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Flashcard'
 *                 message:
 *                   type: string
 *                   example: "Flashcard'lar başarıyla getirildi"
 *       500:
 *         description: Sunucu hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", asyncHandler(getAllFlashcards));

/**
 * @swagger
 * /api/flashcards/dictionary:
 *   get:
 *     summary: Kelime için sözlük verilerini getir
 *     tags: [Flashcards]
 *     parameters:
 *       - in: query
 *         name: word
 *         required: true
 *         schema:
 *           type: string
 *         description: Aranacak kelime
 *         example: "hello"
 *     responses:
 *       200:
 *         description: Sözlük verileri başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     word:
 *                       type: string
 *                       example: "hello"
 *                     phonetic:
 *                       type: string
 *                       example: "/həˈloʊ/"
 *                     pronunciation:
 *                       type: string
 *                       example: "https://api.dictionaryapi.dev/media/pronunciations/en/hello-us.mp3"
 *                     meanings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           partOfSpeech:
 *                             type: string
 *                             example: "noun"
 *                           definitions:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 definition:
 *                                   type: string
 *                                 example:
 *                                   type: string
 *                 message:
 *                   type: string
 *                   example: "Sözlük verileri başarıyla getirildi"
 *       400:
 *         description: Geçersiz istek
 *       404:
 *         description: Kelime bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get("/dictionary", asyncHandler(getDictionaryData));

/**
 * @swagger
 * /api/flashcards/suggestions:
 *   get:
 *     summary: Kelime önerileri (autocomplete)
 *     tags: [Flashcards]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Aranacak kelime (en az 2 karakter)
 *         example: "hello"
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maksimum öneri sayısı
 *         example: 10
 *     responses:
 *       200:
 *         description: Kelime önerileri başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["hello", "hell", "help", "helmet"]
 *                     count:
 *                       type: integer
 *                       example: 4
 *                     source:
 *                       type: object
 *                       properties:
 *                         database:
 *                           type: integer
 *                           description: Veritabanından gelen öneri sayısı
 *                           example: 2
 *                         google:
 *                           type: integer
 *                           description: Google'dan gelen öneri sayısı
 *                           example: 8
 *                 message:
 *                   type: string
 *                   example: "Kelime önerileri başarıyla getirildi"
 *       400:
 *         description: Geçersiz istek
 *       500:
 *         description: Sunucu hatası
 */
router.get("/suggestions", asyncHandler(getWordSuggestions));

/**
 * @swagger
 * /api/flashcards/{id}:
 *   get:
 *     summary: ID'ye göre tek flashcard getir
 *     tags: [Flashcards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Flashcard ID'si
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Flashcard başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Flashcard'
 *       404:
 *         description: Flashcard bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Sunucu hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", asyncHandler(getFlashcardById));

/**
 * @swagger
 * /api/flashcards:
 *   post:
 *     summary: Yeni flashcard oluştur
 *     tags: [Flashcards]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - word
 *             properties:
 *               word:
 *                 type: string
 *                 description: Kelime
 *                 example: "hello"
 *               translation:
 *                 type: string
 *                 description: Çeviri
 *                 example: "merhaba"
 *               example:
 *                 type: string
 *                 description: Örnek cümle
 *                 example: "Hello, how are you?"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Resim dosyası (JPEG, PNG, GIF, WEBP - Max 5MB)
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: Ses dosyası (MP3, WAV, OGG, WEBM - Max 10MB)
 *               imageUrl:
 *                 type: string
 *                 description: Veya resim URL'i (dosya yüklemek yerine)
 *                 example: "https://example.com/image.jpg"
 *               audioUrl:
 *                 type: string
 *                 description: Veya ses URL'i (dosya yüklemek yerine)
 *                 example: "https://example.com/audio.mp3"
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFlashcard'
 *           example:
 *             word: "hello"
 *             translation: "merhaba"
 *             example: "Hello, how are you?"
 *             imageUrl: "https://example.com/image.jpg"
 *             audioUrl: "https://example.com/audio.mp3"
 *     responses:
 *       201:
 *         description: Flashcard başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Flashcard'
 *                 message:
 *                   type: string
 *                   example: "Flashcard başarıyla oluşturuldu"
 *       400:
 *         description: Geçersiz istek (word alanı zorunludur)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Sunucu hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/",
  uploadFiles.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  asyncHandler(createFlashcard)
);

/**
 * @swagger
 * /api/flashcards/{id}:
 *   put:
 *     summary: Flashcard güncelle
 *     tags: [Flashcards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Flashcard ID'si
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               word:
 *                 type: string
 *                 description: Kelime
 *                 example: "hello"
 *               translation:
 *                 type: string
 *                 description: Çeviri
 *                 example: "merhaba"
 *               example:
 *                 type: string
 *                 description: Örnek cümle
 *                 example: "Hello, how are you today?"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Resim dosyası (JPEG, PNG, GIF, WEBP - Max 5MB)
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: Ses dosyası (MP3, WAV, OGG, WEBM - Max 10MB)
 *               imageUrl:
 *                 type: string
 *                 description: Veya resim URL'i (dosya yüklemek yerine)
 *               audioUrl:
 *                 type: string
 *                 description: Veya ses URL'i (dosya yüklemek yerine)
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFlashcard'
 *           example:
 *             word: "hello"
 *             translation: "merhaba"
 *             example: "Hello, how are you today?"
 *     responses:
 *       200:
 *         description: Flashcard başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Flashcard'
 *                 message:
 *                   type: string
 *                   example: "Flashcard başarıyla güncellendi"
 *       404:
 *         description: Flashcard bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Sunucu hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  "/:id",
  uploadFiles.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  asyncHandler(updateFlashcard)
);

/**
 * @swagger
 * /api/flashcards/{id}:
 *   delete:
 *     summary: Flashcard sil
 *     tags: [Flashcards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Flashcard ID'si
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Flashcard başarıyla silindi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Flashcard'
 *                 message:
 *                   type: string
 *                   example: "Flashcard başarıyla silindi"
 *       404:
 *         description: Flashcard bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Sunucu hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", asyncHandler(deleteFlashcard));

export default router;
