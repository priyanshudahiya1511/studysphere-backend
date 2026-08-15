import mongoose from "mongoose";

const summarySchema = new mongoose.Schema(
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
        overview: {
            type: String,
            default: "",
        },
        sections: [
            {
                heading: { type: String },
                content: { type: String },
            },
        ],
        keyPoints: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

const Summary = mongoose.model("Summary", summarySchema);

export default Summary;
