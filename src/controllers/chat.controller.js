import ChatSession from "../models/chatSession.model.js";
import Document from "../models/document.model.js";
import { chatWithContext } from "../utils/gemini.js";
import { retrieveRelevantChunks } from "../utils/retrieval.js";

export const startChat = async (req, res) => {
    try {
        const { documentId } = req.body;
        if (!documentId) {
            return res.status(400).json({ message: "documentId is required" });
        }

        const doucument = await Document.findOne({
            _id: documentId,
            owner: req.user._id,
        });

        if (!doucument) {
            return res.status(404).json({ message: "Document not found" });
        }

        const existingSession = await ChatSession.findOne({
            owner: req.user._id,
            document: documentId,
        });

        if (existingSession) {
            return res.status(200).json({
                message: "Existing chat session retrieved",
                session,
            });
        }

        const session = await ChatSession.create({
            owner: req.user._id,
            document: documentId,
            title: doucument.title || "New Chat",
            messages: [],
        });

        return res.status(201).json({
            message: "Chat session started",
            session,
        });
    } catch (error) {
        console.log("Error in startChat", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { question } = req.body;

        if (!question || question.trim() === "") {
            return res.status(400).json({ message: "question is required" });
        }

        const session = await ChatSession.findOne({
            _id: id,
            owner: req.user._id,
        });
        if (!session) {
            return res.status(404).json({ message: "Chat session not found" });
        }

        const chunks = await retrieveRelevantChunks(
            question,
            session.document,
            req.user._id,
            5
        );

        const recentHistory = session.messages.slice(-6);

        const answer = await chatWithContext(question, chunks, recentHistory);

        session.messages.push({ role: "user", content: question });
        session.messages.push({ role: "assistant", content: answer });
        await session.save();

        return res.status(200).json({
            answer,
            sources: chunks.map((c) => ({
                chunkIndex: c.chunkIndex,
                score: c.score,
            })),
        });
    } catch (error) {
        console.log("Error in sendMessage", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getChatSessions = async (req, res) => {
    try {
        const sessions = await ChatSession.find({ owner: req.user._id })
            .select("-messages")
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            count: sessions.length,
            sessions,
        });
    } catch (error) {
        console.log("Error in getChatSessions", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getChatSessionById = async (req, res) => {
    try {
        const { id } = req.params;

        const session = await ChatSession.findOne({
            _id: id,
            owner: req.user._id,
        });
        if (!session) {
            return res.status(404).json({ message: "Chat session not found" });
        }

        return res.status(200).json({ session });
    } catch (error) {
        console.log("Error in getChatSessionById", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteChatSession = async (req, res) => {
    try {
        const { id } = req.params;

        const session = await ChatSession.findOneAndDelete({
            _id: id,
            owner: req.user._id,
        });
        if (!session) {
            return res.status(404).json({ message: "Chat session not found" });
        }

        return res.status(200).json({ message: "Chat session deleted" });
    } catch (error) {
        console.log("Error in deleteChatSession", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
