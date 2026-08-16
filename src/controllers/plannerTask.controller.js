import PlannerTask from "../models/plannerTask.model.js";

export const createTask = async (req, res) => {
    try {
        const { title, description, dueDate } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        const task = await PlannerTask.create({
            owner: req.user._id,
            title: title.trim(),
            description: description || "",
            dueDate: dueDate || null,
        });

        return res.status(201).json({
            message: "Task created successfully",
            task,
        });
    } catch (error) {
        console.log("Error in createTask", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getTasks = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = { owner: req.user._id };
        if (status && ["pending", "completed"].includes(status)) {
            filter.status = status;
        }

        const tasks = await PlannerTask.find(filter).sort({
            dueDate: 1,
            createdAt: -1,
        });

        return res.status(200).json({
            count: tasks.length,
            tasks,
        });
    } catch (error) {
        console.log("Error in getTasks", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await PlannerTask.findOne({
            _id: id,
            owner: req.user._id,
        });

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        return res.status(200).json({ task });
    } catch (error) {
        console.log("Error in getTaskById", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;

        const { title, description, dueDate, status } = req.body;

        const updates = {};

        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (dueDate !== undefined) updates.dueDate = dueDate;
        if (status !== undefined) {
            if (!["pending", "completed"].includes(status)) {
                return res.status(400).json({ message: "Invalid status" });
            }
            updates.status = status;
        }

        const task = await PlannerTask.findOneAndUpdate(
            { _id: id, owner: req.user._id },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        return res.status(200).json({
            message: "Task updated successfully",
            task,
        });
    } catch (error) {
        console.log("Error in updateTask", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await PlannerTask.findOneAndDelete({
            _id: id,
            owner: req.user._id,
        });

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        return res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.log("Error in deleteTask", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
