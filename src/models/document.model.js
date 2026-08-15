import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
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
        fileUrl: {
            type: String,
            required: true,
        },
        publicId: {
            type: String,
            required: true,
        },
        fileType: {
            type: String,
            required: true,
        },
        fileSize: {
            type: Number,
        },
        extractedText: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const Document = mongoose.model("Document", documentSchema);

export default Document;
