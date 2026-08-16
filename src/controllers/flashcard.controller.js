import FlashcardSet from "../models/flashcard.model.js";
import Note from "../models/note.model.js";
import Document from "../models/document.model.js";
import { generateFlashcards } from "../utils/gemini.js";

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

export const generateFlashcardSet = async (req, res) => {
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
                .json({ message: "sourceType must be 'note' or 'document'" });
        }

        const existing = await FlashcardSet.findOne({
            owner: req.user._id,
            sourceType,
            sourceId,
        });
        if (existing) {
            return res.status(200).json({
                message: "Flashcards retrieved (cached)",
                flashcardSet: existing,
            });
        }

        const text = await getSourceText(sourceType, sourceId, req.user._id);
        if (text === null) {
            return res.status(404).json({ message: "Source not found" });
        }
        if (!text || text.trim() === "") {
            return res
                .status(400)
                .json({
                    message: "Source has no text to generate flashcards from",
                });
        }

        const aiResult = await generateFlashcards(text);

        if (!aiResult.cards || aiResult.cards.length === 0) {
            return res
                .status(502)
                .json({
                    message: "Failed to generate flashcards. Please try again.",
                });
        }

        const flashcardSet = await FlashcardSet.create({
            owner: req.user._id,
            sourceType,
            sourceId,
            title: aiResult.title,
            cards: aiResult.cards,
        });

        return res.status(201).json({
            message: "Flashcards generated successfully",
            flashcardSet,
        });
    } catch (error) {
        console.log("Error in generateFlashcardSet", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getFlashcardSets = async (req, res) => {
    try {
        const sets = await FlashcardSet.find({ owner: req.user._id }).sort({
            createdAt: -1,
        });

        return res.status(200).json({
            count: sets.length,
            flashcardSets: sets,
        });
    } catch (error) {
        console.log("Error in getFlashcardSets", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getFlashcardSetById = async (req, res) => {
    try {
        const { id } = req.params;

        const set = await FlashcardSet.findOne({
            _id: id,
            owner: req.user._id,
        });

        if (!set) {
            return res.status(404).json({ message: "Flashcard set not found" });
        }

        return res.status(200).json({ flashcardSet: set });
    } catch (error) {
        console.log("Error in getFlashcardSetById", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteFlashcardSet = async (req, res) => {
    try {
        const { id } = req.params;

        const set = await FlashcardSet.findOneAndDelete({
            _id: id,
            owner: req.user._id,
        });

        if (!set) {
            return res.status(404).json({ message: "Flashcard set not found" });
        }

        return res
            .status(200)
            .json({ message: "Flashcard set deleted successfully" });
    } catch (error) {
        console.log("Error in deleteFlashcardSet", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
