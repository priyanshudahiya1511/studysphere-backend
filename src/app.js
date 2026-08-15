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

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/notes", noteRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use("/api/v1/summaries", summaryRoutes);

export default app;
