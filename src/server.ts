import dotenv from "dotenv";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import connectDB from "./config/db";
import flashcardRoutes from "./routes/flashcard.routes";

dotenv.config();

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
connectDB();

// Routes
app.use("/api/flashcards", flashcardRoutes);

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Flashcards Backend API çalışıyor!" });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Bir hata oluştu!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});

export default app;
