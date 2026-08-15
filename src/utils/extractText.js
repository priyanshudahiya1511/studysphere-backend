import fs from "fs";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

const extractTextFromBuffer = async (buffer) => {
    try {
        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        await parser.destroy();
        return result.text;
    } catch (error) {
        console.error("Error extracting text from PDF:", error);
        throw error;
    }
};

export const extractText = async (localFilePath, mimeType) => {
    try {
        if (mimeType === "application/pdf") {
            const buffer = fs.readFileSync(localFilePath);
            return await extractTextFromBuffer(buffer);
        }

        if (
            mimeType ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            const result = await mammoth.extractRawText({
                path: localFilePath,
            });
            return result.value;
        }

        // Images or unsupported types → no text extraction (no OCR yet)
        return "";
    } catch (error) {
        console.log("Text extraction error:", error);
        return "";
    }
};
