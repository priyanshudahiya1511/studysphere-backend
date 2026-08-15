import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const Note = mongoose.model("Note", noteSchema);

export default Note;
