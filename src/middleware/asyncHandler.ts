import { Request, Response, NextFunction } from "express";

/**
 * Async handler wrapper - Try-catch tekrarını önler
 * Tüm async controller fonksiyonlarını sarmalayarak
 * hataları otomatik olarak error handler'a yönlendirir
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
