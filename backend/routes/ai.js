import express from "express";
import { generateTaskAI } from "../controllers/aiController.js";

const router = express.Router();

// Use the controller
router.post("/generate", generateTaskAI);

export default router;