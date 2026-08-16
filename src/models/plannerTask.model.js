import mongoose from "mongoose";

const plannerTaskSchema = new mongoose.Schema(
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
        description: {
            type: String,
            default: "",
        },
        dueDate: {
            type: Date,
        },
        status: {
            type: String,
            enum: ["pending", "completed"],
            default: "pending",
        },
    },
    { timestamps: true }
);

const PlannerTask = mongoose.model("PlannerTask", plannerTaskSchema);

export default PlannerTask;
