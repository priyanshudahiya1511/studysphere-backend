import { GoogleGenAI } from "@google/genai";

export const summarizeText = async (text) => {
    try {
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        const prompt = `
        You are a helpful study assistant that creates clear, well-organized study summaries.
        Analyze the following study material and break it down into logical sections.
        Be accurate, concise, and student-friendly.

        Respond ONLY in this JSON format, no extra text, no markdown backticks:
        {
            "title": "<a short, descriptive title for this material>",
            "overview": "<a 2-3 sentence high-level overview of what this material covers>",
            "sections": [
                {
                    "heading": "<section heading>",
                    "content": "<clear explanation of this section in markdown, 1-3 paragraphs>"
                }
            ],
            "keyPoints": [<list of the most important takeaways as short strings>]
        }

        Guidelines:
        - Break the material into 3-6 logical sections based on its actual structure.
        - Each section heading should be short and descriptive.
        - Section content should explain the concept, not just restate it.
        - keyPoints should be the 5-8 most important things to remember.

        Here is the study material: ${text}
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: [{ text: prompt }],
        });

        const cleaned = response.text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        return {
            title: parsed.title || "",
            overview: parsed.overview || "",
            sections: parsed.sections || [],
            keyPoints: parsed.keyPoints || [],
        };
    } catch (error) {
        console.error("Error summarizing text with Gemini:", error);
        throw error;
    }
};
