import express from "express";
import {
    createNote,
    getNotes,
    getNoteById,
    updateNote,
    deleteNote,
} from "../controllers/note.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/createnote", protectRoute, createNote);
router.get("/getnotes", protectRoute, getNotes);
router.get("/getnotebyid/:id", protectRoute, getNoteById);
router.put("/updatenote/:id", protectRoute, updateNote);
router.delete("/deletenote/:id", protectRoute, deleteNote);

export default router;
