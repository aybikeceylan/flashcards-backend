import dotenv from "dotenv";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import connectDB from "./config/db";
import flashcardRoutes from "./routes/flashcard.routes";
import uploadRoutes from "./routes/upload.routes";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middleware/errorHandler";
import { swaggerDocs } from "./config/swagger";

dotenv.config();

const app: Express = express();

// Middleware
// CORS - React Native ve Web desteği için
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:19006", // Expo web
  "http://localhost:8081", // Android Emulator
  "exp://localhost:19000", // Expo dev client
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // React Native'de origin null olabilir veya olmayabilir
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Development için tüm origin'lere izin ver (production'da kaldırılmalı)
        if (process.env.NODE_ENV !== "production") {
          callback(null, true);
        } else {
          callback(new Error("CORS policy violation"));
        }
      }
    },
    credentials: true, // Cookie göndermek için gerekli
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Cookie'leri parse etmek için

// Static file serving - Upload edilen dosyalar için
const uploadsDir = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsDir));

// MongoDB connection
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/upload", uploadRoutes);

// Swagger docs
swaggerDocs(app);

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Flashcards Backend API çalışıyor!" });
});

// Error handling middleware
app.use(errorHandler);

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});

export default app;
