import { Request, Response } from "express";
import path from "path";
import { success, badRequest } from "../utils/response";

/**
 * Upload controller fonksiyonları
 * Multer middleware ile yüklenen dosyaları işler
 */

// Tek resim yükleme
export const uploadImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.file) {
    res.status(400).json(badRequest("Resim dosyası yüklenmedi"));
    return;
  }

  // Dosya URL'ini oluştur
  const fileUrl = `/uploads/images/${req.file.filename}`;

  res.status(200).json(
    success(
      {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl,
      },
      "Resim başarıyla yüklendi"
    )
  );
};

// Tek ses dosyası yükleme
export const uploadAudio = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.file) {
    res.status(400).json(badRequest("Ses dosyası yüklenmedi"));
    return;
  }

  // Dosya URL'ini oluştur
  const fileUrl = `/uploads/audio/${req.file.filename}`;

  res.status(200).json(
    success(
      {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl,
      },
      "Ses dosyası başarıyla yüklendi"
    )
  );
};

// Çoklu dosya yükleme (hem resim hem ses)
export const uploadFiles = async (
  req: Request,
  res: Response
): Promise<void> => {
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  if (!files || Object.keys(files).length === 0) {
    res.status(400).json(badRequest("Dosya yüklenmedi"));
    return;
  }

  const uploadedFiles: any[] = [];

  // Tüm field'lardaki dosyaları topla
  Object.keys(files).forEach((fieldname) => {
    files[fieldname].forEach((file) => {
      const fileType = file.mimetype.startsWith("image/") ? "image" : "audio";
      const fileUrl = `/uploads/${fileType === "image" ? "images" : "audio"}/${
        file.filename
      }`;

      uploadedFiles.push({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        type: fileType,
        fieldname: fieldname,
        url: fileUrl,
      });
    });
  });

  res
    .status(200)
    .json(
      success(uploadedFiles, `${uploadedFiles.length} dosya başarıyla yüklendi`)
    );
};
