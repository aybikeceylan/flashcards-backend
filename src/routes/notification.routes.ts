import { Router } from "express";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  getNotificationHistory,
  testDailyReminder,
  testMotivationMessage,
} from "../controllers/notification.controller";
import { protect } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     NotificationPreferences:
 *       type: object
 *       properties:
 *         dailyReminder:
 *           type: boolean
 *           description: Günlük hatırlatma açık/kapalı
 *           example: true
 *         reminderTime:
 *           type: string
 *           format: time
 *           description: Hatırlatma saati (HH:MM formatında)
 *           example: "09:00"
 *         motivationMessages:
 *           type: boolean
 *           description: Motivasyon mesajları açık/kapalı
 *           example: true
 *         motivationFrequency:
 *           type: string
 *           enum: [daily, weekly, biweekly]
 *           description: Motivasyon mesajı sıklığı
 *           example: "weekly"
 *     UpdateNotificationPreferences:
 *       type: object
 *       properties:
 *         dailyReminder:
 *           type: boolean
 *           example: true
 *         reminderTime:
 *           type: string
 *           format: time
 *           example: "09:00"
 *         motivationMessages:
 *           type: boolean
 *           example: true
 *         motivationFrequency:
 *           type: string
 *           enum: [daily, weekly, biweekly]
 *           example: "weekly"
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         userId:
 *           type: string
 *           example: 507f1f77bcf86cd799439012
 *         type:
 *           type: string
 *           enum: [daily_reminder, motivation]
 *           example: "daily_reminder"
 *         email:
 *           type: string
 *           example: "user@example.com"
 *         subject:
 *           type: string
 *           example: "📚 Günlük Hatırlatma - Flashcard Çalışma Zamanı!"
 *         sentAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T09:00:00.000Z"
 *         status:
 *           type: string
 *           enum: [sent, failed]
 *           example: "sent"
 *         errorMessage:
 *           type: string
 *           example: null
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     NotificationHistoryResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             notifications:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *             currentPage:
 *               type: number
 *               example: 1
 *             totalPages:
 *               type: number
 *               example: 5
 *             totalItems:
 *               type: number
 *               example: 50
 *         message:
 *           type: string
 *           example: "Notification geçmişi getirildi"
 */

/**
 * @swagger
 * /api/notifications/preferences:
 *   get:
 *     summary: Kullanıcının notification tercihlerini getir
 *     description: Giriş yapmış kullanıcının notification tercihlerini döndürür
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Notification tercihleri başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/NotificationPreferences'
 *                 message:
 *                   type: string
 *                   example: "Notification tercihleri getirildi"
 *       401:
 *         description: Yetkilendirme hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Kullanıcı bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/preferences", protect, asyncHandler(getNotificationPreferences));

/**
 * @swagger
 * /api/notifications/preferences:
 *   put:
 *     summary: Kullanıcının notification tercihlerini güncelle
 *     description: Giriş yapmış kullanıcının notification tercihlerini günceller
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNotificationPreferences'
 *           example:
 *             dailyReminder: true
 *             reminderTime: "09:00"
 *             motivationMessages: true
 *             motivationFrequency: "weekly"
 *     responses:
 *       200:
 *         description: Notification tercihleri başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/NotificationPreferences'
 *                 message:
 *                   type: string
 *                   example: "Notification tercihleri güncellendi"
 *       400:
 *         description: Geçersiz istek (örneğin yanlış saat formatı)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Yetkilendirme hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Kullanıcı bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  "/preferences",
  protect,
  asyncHandler(updateNotificationPreferences)
);

/**
 * @swagger
 * /api/notifications/history:
 *   get:
 *     summary: Kullanıcının notification geçmişini getir
 *     description: Giriş yapmış kullanıcının gönderilen notification'ların geçmişini sayfalama ile döndürür
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Sayfa numarası
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Sayfa başına kayıt sayısı
 *     responses:
 *       200:
 *         description: Notification geçmişi başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationHistoryResponse'
 *       401:
 *         description: Yetkilendirme hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/history", protect, asyncHandler(getNotificationHistory));

/**
 * @swagger
 * /api/notifications/test/daily-reminder:
 *   post:
 *     summary: Test - Kullanıcıya hemen daily reminder gönder
 *     description: Giriş yapmış kullanıcıya test amaçlı olarak hemen daily reminder email'i gönderir
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Test daily reminder başarıyla gönderildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                   example: "Test daily reminder gönderildi"
 *       401:
 *         description: Yetkilendirme hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Kullanıcı bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Email gönderme hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/test/daily-reminder", protect, asyncHandler(testDailyReminder));

/**
 * @swagger
 * /api/notifications/test/motivation:
 *   post:
 *     summary: Test - Kullanıcıya hemen motivasyon mesajı gönder
 *     description: Giriş yapmış kullanıcıya test amaçlı olarak hemen motivasyon email'i gönderir
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Test motivasyon mesajı başarıyla gönderildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                   example: "Test motivasyon mesajı gönderildi"
 *       401:
 *         description: Yetkilendirme hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Kullanıcı bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Email gönderme hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/test/motivation", protect, asyncHandler(testMotivationMessage));

export default router;
