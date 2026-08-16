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

export const generateQuiz = async (text, numQuestions) => {
    try {
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        const prompt = `
        You are a helpful study assistant that creates multiple-choice quizzes.
        Based on the following study material, generate exactly ${numQuestions} multiple-choice questions.
        Each question must have exactly 4 options, with exactly one correct answer.
        Vary the difficulty and cover different parts of the material.

        Respond ONLY in this JSON format, no extra text, no markdown backticks:
        {
            "title": "<a short title for this quiz>",
            "questions": [
                {
                    "question": "<the question text>",
                    "options": ["<option A>", "<option B>", "<option C>", "<option D>"],
                    "correctAnswer": <index 0-3 of the correct option>,
                    "explanation": "<a short explanation of why the answer is correct>"
                }
            ]
        }

        Guidelines:
        - Generate exactly ${numQuestions} questions.
        - Each question must have exactly 4 options.
        - correctAnswer is the array index (0, 1, 2, or 3) of the correct option.
        - Base every question strictly on the provided material.

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
            questions: parsed.questions || [],
        };
    } catch (error) {
        console.error("Error generating quiz with Gemini:", error);
        throw error;
    }
};

export const generateFlashcards = async (text) => {
    try {
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        const prompt = `
        You are a helpful study assistant that creates flashcards for active recall.
        Based on the following study material, generate exactly 10 flashcards.
        Each flashcard has a "front" (a term, concept, or question) and a "back" (the answer or definition).
        Keep the front concise and the back clear and complete but not too long.

        Respond ONLY in this JSON format, no extra text, no markdown backticks:
        {
            "title": "<a short title for this flashcard set>",
            "cards": [
                {
                    "front": "<term, concept, or question>",
                    "back": "<the answer or definition>"
                }
            ]
        }

        Guidelines:
        - Generate exactly 10 flashcards.
        - Cover the most important concepts from the material.
        - Base every card strictly on the provided material.

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
            cards: parsed.cards || [],
        };
    } catch (error) {
        console.error("Error generating flashcards with Gemini:", error);
        throw error;
    }
};

export const embedText = async (text) => {
    try {
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        const response = await ai.models.embedContent({
            model: "gemini-embedding-001",
            contents: [{ text }],
            config: {
                outputDimensionality: 768,
            },
        });

        return response.embeddings[0].values;
    } catch (error) {
        console.error("Error embedding text with Gemini:", error);
        throw error;
    }
};

export const chatWithContext = async (
    question,
    contextChunks,
    history = []
) => {
    try {
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        const context = contextChunks
            .map((c, i) => `[Chunk ${i + 1}]\n${c.text}`)
            .join("\n\n");

        const historyText = history
            .map(
                (m) =>
                    `${m.role === "user" ? "Student" : "Assistant"}: ${m.content}`
            )
            .join("\n");

        const prompt = `
        You are a helpful study assistant. Answer the student's question using ONLY the provided context from their study material.
        If the answer is not in the context, say you couldn't find it in the material rather than making something up.
        Be clear, accurate, and explain in a way that helps the student learn.

        CONTEXT FROM STUDY MATERIAL:
        ${context}

        ${historyText ? `CONVERSATION SO FAR:\n${historyText}\n` : ""}

        STUDENT'S QUESTION: ${question}

        Answer:
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: [{ text: prompt }],
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error in chatWithContext with Gemini:", error);
        throw error;
    }
};
