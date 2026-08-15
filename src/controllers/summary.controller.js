import Summary from "../models/summary.model.js";
import Note from "../models/note.model.js";
import Document from "../models/document.model.js";
import { summarizeText } from "../utils/gemini.js";

const getSourceText = async (sourceType, sourceId, userId) => {
    if (sourceType === "note") {
        const note = await Note.findOne({ _id: sourceId, owner: userId });
        if (!note) return null;
        return note.content;
    }

    if (sourceType === "document") {
        const document = await Document.findOne({
            _id: sourceId,
            owner: userId,
        });
        if (!document) return null;
        return document.extractedText;
    }

    return null;
};

export const generateSummary = async (req, res) => {
    try {
        const { sourceType, sourceId } = req.body;

        if (!sourceType || !sourceId) {
            return res
                .status(400)
                .json({ message: "sourceType and sourceId are required" });
        }

        if (!["note", "document"].includes(sourceType)) {
            return res
                .status(400)
                .json({ message: "sourceType and sourceId are required" });
        }

        const existing = await Summary.findOne({
            owner: req.user._id,
            sourceType,
            sourceId,
        });

        if (existing) {
            return res.status(200).json({
                message: "Summary retrieved (cached)",
                summary: existing,
            });
        }

        const text = await getSourceText(sourceType, sourceId, req.user._id);
        if (text === null) {
            return res.status(404).json({ message: "Source not found" });
        }
        if (!text || text.trim() === "") {
            return res
                .status(400)
                .json({ message: "Source has no text to summarize" });
        }

        const aiResult = await summarizeText(text);

        const summary = await Summary.create({
            owner: req.user._id,
            sourceType,
            sourceId,
            title: aiResult.title,
            overview: aiResult.overview,
            sections: aiResult.sections,
            keyPoints: aiResult.keyPoints,
        });

        return res.status(201).json({
            message: "Summary generated successfully",
            summary,
        });
    } catch (error) {
        console.log("Error in generateSummary", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getSummaries = async (req, res) => {
    try {
        const summaries = await Summary.find({ owner: req.user._id }).sort({
            createdAt: -1,
        });

        return res.status(200).json({
            count: summaries.length,
            summaries,
        });
    } catch (error) {
        console.log("Error in getSummaries", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getSummaryById = async (req, res) => {
    try {
        const { id } = req.params;

        const summary = await Summary.findOne({
            _id: id,
            owner: req.user._id,
        });

        if (!summary) {
            return res.status(404).json({ message: "Summary not found" });
        }

        return res.status(200).json({ summary });
    } catch (error) {
        console.log("Error in getSummaryById", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteSummary = async (req, res) => {
    try {
        const { id } = req.params;

        const summary = await Summary.findOneAndDelete({
            _id: id,
            owner: req.user._id,
        });

        if (!summary) {
            return res.status(404).json({ message: "Summary not found" });
        }

        return res
            .status(200)
            .json({ message: "Summary deleted successfully" });
    } catch (error) {
        console.log("Error in deleteSummary", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
