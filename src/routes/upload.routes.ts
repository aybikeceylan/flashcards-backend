import express, { Router } from "express";
import {
  uploadImage,
  uploadAudio,
  uploadFiles,
} from "../controllers/upload.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import {
  uploadImage as multerImage,
  uploadAudio as multerAudio,
  uploadFiles as multerFiles,
} from "../config/multer";

const router: Router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UploadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             filename:
 *               type: string
 *               example: "image-1234567890.jpg"
 *             originalName:
 *               type: string
 *               example: "my-image.jpg"
 *             size:
 *               type: number
 *               example: 102400
 *             mimetype:
 *               type: string
 *               example: "image/jpeg"
 *             url:
 *               type: string
 *               example: "/uploads/images/image-1234567890.jpg"
 *         message:
 *           type: string
 *           example: "Resim başarıyla yüklendi"
 */

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     summary: Resim dosyası yükle
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Yüklenecek resim dosyası (JPEG, PNG, GIF, WEBP - Max 5MB)
 *     responses:
 *       200:
 *         description: Resim başarıyla yüklendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UploadResponse/properties/data'
 *                 message:
 *                   type: string
 *                   example: "Resim başarıyla yüklendi"
 *       400:
 *         description: Geçersiz istek veya dosya tipi
 *       500:
 *         description: Sunucu hatası
 */
router.post("/image", multerImage.single("image"), asyncHandler(uploadImage));

/**
 * @swagger
 * /api/upload/audio:
 *   post:
 *     summary: Ses dosyası yükle
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - audio
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: Yüklenecek ses dosyası (MP3, WAV, OGG, WEBM - Max 10MB)
 *     responses:
 *       200:
 *         description: Ses dosyası başarıyla yüklendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UploadResponse/properties/data'
 *                 message:
 *                   type: string
 *                   example: "Ses dosyası başarıyla yüklendi"
 *       400:
 *         description: Geçersiz istek veya dosya tipi
 *       500:
 *         description: Sunucu hatası
 */
router.post("/audio", multerAudio.single("audio"), asyncHandler(uploadAudio));

/**
 * @swagger
 * /api/upload/files:
 *   post:
 *     summary: Çoklu dosya yükle (resim ve/veya ses)
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Yüklenecek resim dosyaları (JPEG, PNG, GIF, WEBP - Max 5MB each)
 *               audios:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Yüklenecek ses dosyaları (MP3, WAV, OGG, WEBM - Max 10MB each)
 *     responses:
 *       200:
 *         description: Dosyalar başarıyla yüklendi
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
 *                     type: object
 *                     properties:
 *                       filename:
 *                         type: string
 *                       originalName:
 *                         type: string
 *                       size:
 *                         type: number
 *                       mimetype:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [image, audio]
 *                       url:
 *                         type: string
 *                 message:
 *                   type: string
 *                   example: "2 dosya başarıyla yüklendi"
 *       400:
 *         description: Geçersiz istek veya dosya tipi
 *       500:
 *         description: Sunucu hatası
 */
router.post(
  "/files",
  multerFiles.fields([
    { name: "images", maxCount: 5 },
    { name: "audios", maxCount: 5 },
  ]),
  asyncHandler(uploadFiles)
);

export default router;
