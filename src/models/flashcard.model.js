import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
    front: { type: String, required: true },
    back: { type: String, required: true },
});

const flashcardSetSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        sourceType: {
            type: String,
            enum: ["note", "document"],
            required: true,
        },
        sourceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        title: {
            type: String,
            default: "",
        },
        cards: {
            type: [cardSchema],
            required: true,
        },
    },
    { timestamps: true }
);

const FlashcardSet = mongoose.model("FlashcardSet", flashcardSetSchema);

export default FlashcardSet;
