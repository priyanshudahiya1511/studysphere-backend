import express from "express";
import {
    uploadDocument,
    getDocuments,
    getDocumentById,
    deleteDocument,
} from "../controllers/document.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.post("/upload", protectRoute, upload.single("file"), uploadDocument);
router.get("/getdocuments", protectRoute, getDocuments);
router.get("/getdocumentbyid/:id", protectRoute, getDocumentById);
router.delete("/deletedocument/:id", protectRoute, deleteDocument);

export default router;
