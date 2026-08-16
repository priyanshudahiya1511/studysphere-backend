import DocumentChunk from "../models/documentChunk.model.js";
import { embedText } from "./gemini.js";

// Given a question, embed it and find the most similar chunks for a specific document.
export const retrieveRelevantChunks = async (
    question,
    documentId,
    ownerId,
    limit = 5
) => {
    // 1. Embed the question into a vector (same model + dimension as the chunks)
    const queryVector = await embedText(question);

    // 2. Run Atlas Vector Search to find the closest chunks
    const results = await DocumentChunk.aggregate([
        {
            $vectorSearch: {
                index: "vector_index",
                path: "embedding",
                queryVector: queryVector,
                numCandidates: 100,
                limit: limit,
                filter: {
                    owner: ownerId,
                    document: documentId,
                },
            },
        },
        {
            $project: {
                text: 1,
                chunkIndex: 1,
                score: { $meta: "vectorSearchScore" },
            },
        },
    ]);

    return results;
};
