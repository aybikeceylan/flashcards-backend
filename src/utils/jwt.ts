import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

export interface TokenPayload {
  userId: string;
  email: string;
}

/**
 * JWT token oluştur
 */
export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  } as jwt.SignOptions);
};

/**
 * JWT token doğrula
 */
export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error("Geçersiz veya süresi dolmuş token");
  }
};

/**
 * Cookie seçenekleri
 */
export const cookieOptions = {
  httpOnly: true, // JavaScript ile erişilemez (XSS koruması)
  secure: process.env.NODE_ENV === "production", // HTTPS'de çalışır
  sameSite: "strict" as const, // CSRF koruması
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün (milisaniye cinsinden)
};
