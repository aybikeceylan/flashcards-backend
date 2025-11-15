import dotenv from "dotenv";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import connectDB from "./config/db";
import flashcardRoutes from "./routes/flashcard.routes";
import uploadRoutes from "./routes/upload.routes";
import authRoutes from "./routes/auth.routes";
import notificationRoutes from "./routes/notification.routes";
import { errorHandler } from "./middleware/errorHandler";
import { swaggerDocs } from "./config/swagger";
import { startCronJobs } from "./services/cron.service";

dotenv.config();

const app: Express = express();

// Middleware
// CORS - Cookie desteği için credentials: true
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
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
app.use("/api/notifications", notificationRoutes);

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

  // Cron job'ları başlat
  startCronJobs();
});

export default app;
