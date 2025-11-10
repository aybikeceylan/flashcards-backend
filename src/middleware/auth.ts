import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { unauthorized } from "../utils/response";

/**
 * Auth Middleware
 * Protected route'lar için token doğrulama
 * Token'ı cookie'den veya Authorization header'dan alır
 */

// Request interface'ini genişlet
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // 1. Token'ı cookie'den al
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Token'ı Authorization header'dan al (Bearer token)
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Token yoksa
    if (!token) {
      res
        .status(401)
        .json(unauthorized("Token bulunamadı. Lütfen giriş yapın."));
      return;
    }

    // Token'ı doğrula
    const decoded = verifyToken(token);

    // User bilgisini request'e ekle
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error: any) {
    res.status(401).json(unauthorized(error.message || "Geçersiz token"));
  }
};
