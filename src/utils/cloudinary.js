import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (localFilePath, userId) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            folder: `studysphere/${userId}/documents`,
            resource_type: "auto",
        });

        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.log("Cloudinary upload error:", error);
        return null;
    }
};

export const deleteFromCloudinary = async (publicId, resourceType = "auto") => {
    try {
        if (!publicId) return null;
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });
        return response;
    } catch (error) {
        console.log("Cloudinary delete error:", error);
        return null;
    }
};
