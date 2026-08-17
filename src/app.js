import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/health", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
});

import authRoutes from "./routes/auth.routes.js";
import noteRoutes from "./routes/note.routes.js";
import documentRoutes from "./routes/document.routes.js";
import summaryRoutes from "./routes/summary.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import flashcardRoutes from "./routes/flashcard.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import plannerTaskRoutes from "./routes/plannerTask.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/notes", noteRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use("/api/v1/summaries", summaryRoutes);
app.use("/api/v1/quizzes", quizRoutes);
app.use("/api/v1/flashcards", flashcardRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/planner", plannerTaskRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

export default app;
