import express from "express";
import {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
} from "../controllers/plannerTask.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/createtask", protectRoute, createTask);
router.get("/gettasks", protectRoute, getTasks);
router.get("/gettaskbyid/:id", protectRoute, getTaskById);
router.put("/updatetask/:id", protectRoute, updateTask);
router.delete("/deletetask/:id", protectRoute, deleteTask);

export default router;
