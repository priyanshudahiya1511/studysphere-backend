import Document from "../models/document.model.js";
import {
    uploadToCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { extractText } from "../utils/extractText.js";
import fs from "fs";

export const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { title } = req.body;
        const localFilePath = req.file.path;
        const mimeType = req.file.mimetype;

        const extractedText = await extractText(localFilePath, mimeType);

        const cloudinaryResponse = await uploadToCloudinary(
            localFilePath,
            req.user._id
        );

        if (!cloudinaryResponse) {
            return res
                .status(500)
                .json({ message: "File upload failed. Please try again." });
        }

        const document = await Document.create({
            owner: req.user._id,
            title: title || req.file.originalname,
            fileUrl: cloudinaryResponse.secure_url,
            publicId: cloudinaryResponse.public_id,
            fileType: mimeType,
            fileSize: req.file.size,
            extractedText,
        });

        return res.status(201).json({
            message: "Document uploaded successfully",
            document,
        });
    } catch (error) {
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.log("Error in uploadDocument", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ owner: req.user._id })
            .select("-extractedText")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: documents.length,
            documents,
        });
    } catch (error) {
        console.log("Error in getDocuments", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getDocumentById = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await Document.findOne({
            _id: id,
            owner: req.user._id,
        });

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        return res.status(200).json({ document });
    } catch (error) {
        console.log("Error in getDocumentById", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await Document.findOne({
            _id: id,
            owner: req.user._id,
        });

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        await deleteFromCloudinary(document.publicId);
        await Document.deleteOne({ _id: id, owner: req.user._id });

        return res
            .status(200)
            .json({ message: "Document deleted successfully" });
    } catch (error) {
        console.log("Error in deleteDocument", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
