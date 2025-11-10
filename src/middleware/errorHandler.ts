import { Request, Response, NextFunction } from "express";

/**
 * Error Handler Middleware
 * Tüm hataları yakalar ve tutarlı bir formatta döner
 *
 * ÖNEMLİ: Bu middleware server.ts'te EN SONDA olmalı!
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: messages,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Bu kayıt zaten mevcut",
    });
  }

  // Mongoose cast error (invalid ID format)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Geçersiz ID formatı",
    });
  }

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "Dosya boyutu çok büyük",
    });
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({
      success: false,
      message: "Çok fazla dosya yüklendi",
    });
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      message: "Beklenmeyen dosya alanı",
    });
  }

  // Default error
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
