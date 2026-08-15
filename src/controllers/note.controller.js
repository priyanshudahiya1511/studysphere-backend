import Note from "../models/note.model.js";

export const createNote = async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        const note = await Note.create({
            owner: req.user._id,
            title,
            content: content || "",
        });

        return res.status(201).json({
            message: "Note created successfully",
            note,
        });
    } catch (error) {
        console.log("Error in createNote", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ owner: req.user._id }).sort({
            createdAt: -1,
        });

        return res.status(200).json({
            count: notes.length,
            notes,
        });
    } catch (error) {
        console.log("Error in getNotes", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getNoteById = async (req, res) => {
    try {
        const { id } = req.params;

        const note = await Note.findOne({ _id: id, owner: req.user._id });

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        return res.status(200).json({ note });
    } catch (error) {
        console.log("Error in getNoteById", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateNote = async (req, res) => {
    try {
        const { id } = req.params;

        const { title, content } = req.body;

        const note = await Note.findOneAndUpdate(
            { _id: id, owner: req.user._id },
            { $set: { title, content } },
            { new: true, runValidators: true }
        );

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        return res.status(200).json({
            message: "Note updated successfully",
            note,
        });
    } catch (error) {
        console.log("Error in updateNote", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;

        const note = await Note.findOneAndDelete({
            _id: id,
            owner: req.user._id,
        });

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        return res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
        console.log("Error in deleteNote", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
