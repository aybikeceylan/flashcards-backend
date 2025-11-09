import express, { Router } from "express";
import {
  getAllFlashcards,
  getFlashcardById,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
} from "../controllers/flashcard.controller";

const router: Router = express.Router();

// GET /api/flashcards - Get all flashcards
router.get("/", getAllFlashcards);

// GET /api/flashcards/:id - Get single flashcard
router.get("/:id", getFlashcardById);

// POST /api/flashcards - Create new flashcard
router.post("/", createFlashcard);

// PUT /api/flashcards/:id - Update flashcard
router.put("/:id", updateFlashcard);

// DELETE /api/flashcards/:id - Delete flashcard
router.delete("/:id", deleteFlashcard);

export default router;
