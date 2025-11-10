import { Request, Response } from "express";
import User from "../models/user.model";
import { badRequest, success, unauthorized } from "../utils/response";
import { generateToken, cookieOptions } from "../utils/jwt";

/**
 * Auth Controller
 * Register, Login, Logout ve Me (current user) işlemleri
 */

// Register - Yeni kullanıcı kaydı
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    res.status(400).json(badRequest("Tüm alanlar zorunludur"));
    return;
  }

  // Email format kontrolü
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json(badRequest("Geçerli bir email adresi giriniz"));
    return;
  }

  // Şifre uzunluk kontrolü
  if (password.length < 6) {
    res.status(400).json(badRequest("Şifre en az 6 karakter olmalıdır"));
    return;
  }

  // Kullanıcı zaten var mı kontrol et
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).json(badRequest("Bu email adresi zaten kullanılıyor"));
    return;
  }

  // Yeni kullanıcı oluştur
  const user = await User.create({
    name,
    email,
    password, // Model'de otomatik hash'lenecek
  });

  // Token oluştur
  const token = generateToken({
    userId: String(user._id),
    email: user.email,
  });

  // Token'ı httpOnly cookie'ye kaydet
  res.cookie("token", token, cookieOptions);

  // Response (password'ü gönderme)
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
  };

  res.status(201).json(success(userResponse, "Kullanıcı başarıyla kaydedildi"));
};

// Login - Kullanıcı girişi
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    res.status(400).json(badRequest("Email ve şifre zorunludur"));
    return;
  }

  // Kullanıcıyı bul (password dahil)
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    res.status(401).json(unauthorized("Geçersiz email veya şifre"));
    return;
  }

  // Şifre kontrolü
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    res.status(401).json(unauthorized("Geçersiz email veya şifre"));
    return;
  }

  // Token oluştur
  const token = generateToken({
    userId: String(user._id),
    email: user.email,
  });

  // Token'ı httpOnly cookie'ye kaydet
  res.cookie("token", token, cookieOptions);

  // Response (password'ü gönderme)
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
  };

  res.status(200).json(success(userResponse, "Giriş başarılı"));
};

// Logout - Kullanıcı çıkışı
export const logout = async (req: Request, res: Response): Promise<void> => {
  // Cookie'yi temizle
  res.cookie("token", "", {
    ...cookieOptions,
    maxAge: 0, // Hemen sil
  });

  res.status(200).json(success(null, "Çıkış başarılı"));
};

// Me - Mevcut kullanıcı bilgilerini getir
export const me = async (req: Request, res: Response): Promise<void> => {
  // req.user protect middleware'den gelir (zaten doğrulanmış)
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json(unauthorized("Yetkilendirme hatası"));
    return;
  }

  const user = await User.findById(userId);

  if (!user) {
    res.status(404).json(unauthorized("Kullanıcı bulunamadı"));
    return;
  }

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
  };

  res.status(200).json(success(userResponse));
};
