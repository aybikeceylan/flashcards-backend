import { Request, Response } from "express";
import User from "../models/user.model";
import Notification from "../models/notification.model";
import { success, badRequest, notFound } from "../utils/response";
import {
  sendDailyReminder,
  sendMotivationMessage,
} from "../services/notification.service";

/**
 * Notification Controller
 * Kullanıcı notification tercihlerini yönetir
 */

/**
 * Kullanıcının notification tercihlerini getir
 */
export const getNotificationPreferences = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as any).user?.id;

  if (!userId) {
    res.status(401).json(badRequest("Kullanıcı kimliği bulunamadı"));
    return;
  }

  const user = await User.findById(userId).select("notificationPreferences");

  if (!user) {
    res.status(404).json(notFound("Kullanıcı bulunamadı"));
    return;
  }

  res
    .status(200)
    .json(
      success(
        user.notificationPreferences || {},
        "Notification tercihleri getirildi"
      )
    );
};

/**
 * Kullanıcının notification tercihlerini güncelle
 */
export const updateNotificationPreferences = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as any).user?.id;

  if (!userId) {
    res.status(401).json(badRequest("Kullanıcı kimliği bulunamadı"));
    return;
  }

  const {
    dailyReminder,
    reminderTime,
    motivationMessages,
    motivationFrequency,
  } = req.body;

  // Validation
  if (reminderTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(reminderTime)) {
    res
      .status(400)
      .json(badRequest("Geçerli bir saat formatı giriniz (HH:MM)"));
    return;
  }

  if (
    motivationFrequency &&
    !["daily", "weekly", "biweekly"].includes(motivationFrequency)
  ) {
    res
      .status(400)
      .json(
        badRequest(
          "Motivasyon sıklığı 'daily', 'weekly' veya 'biweekly' olmalıdır"
        )
      );
    return;
  }

  const updateData: any = {};

  if (dailyReminder !== undefined) {
    updateData["notificationPreferences.dailyReminder"] = dailyReminder;
  }

  if (reminderTime !== undefined) {
    updateData["notificationPreferences.reminderTime"] = reminderTime;
  }

  if (motivationMessages !== undefined) {
    updateData["notificationPreferences.motivationMessages"] =
      motivationMessages;
  }

  if (motivationFrequency !== undefined) {
    updateData["notificationPreferences.motivationFrequency"] =
      motivationFrequency;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select("notificationPreferences");

  if (!user) {
    res.status(404).json(notFound("Kullanıcı bulunamadı"));
    return;
  }

  res
    .status(200)
    .json(
      success(
        user.notificationPreferences,
        "Notification tercihleri güncellendi"
      )
    );
};

/**
 * Kullanıcının notification geçmişini getir
 */
export const getNotificationHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as any).user?.id;

  if (!userId) {
    res.status(401).json(badRequest("Kullanıcı kimliği bulunamadı"));
    return;
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ userId })
    .sort({ sentAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments({ userId });

  res.status(200).json(
    success(
      {
        notifications,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
      "Notification geçmişi getirildi"
    )
  );
};

/**
 * Test: Kullanıcıya hemen daily reminder gönder
 */
export const testDailyReminder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as any).user?.id;

  if (!userId) {
    res.status(401).json(badRequest("Kullanıcı kimliği bulunamadı"));
    return;
  }

  const user = await User.findById(userId);

  if (!user) {
    res.status(404).json(notFound("Kullanıcı bulunamadı"));
    return;
  }

  try {
    await sendDailyReminder(user);
    res.status(200).json(success(null, "Test daily reminder gönderildi"));
  } catch (error: any) {
    res.status(500).json(badRequest(error.message));
  }
};

/**
 * Test: Kullanıcıya hemen motivasyon mesajı gönder
 */
export const testMotivationMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as any).user?.id;

  if (!userId) {
    res.status(401).json(badRequest("Kullanıcı kimliği bulunamadı"));
    return;
  }

  const user = await User.findById(userId);

  if (!user) {
    res.status(404).json(notFound("Kullanıcı bulunamadı"));
    return;
  }

  try {
    await sendMotivationMessage(user);
    res.status(200).json(success(null, "Test motivasyon mesajı gönderildi"));
  } catch (error: any) {
    res.status(500).json(badRequest(error.message));
  }
};
