# StudySphere AI — Backend

An AI-powered study companion backend. Users upload study material (PDFs, DOCX, images) or write their own notes, and the app turns that material into structured summaries, quizzes, flashcards, and a document-aware AI chat — helping students learn faster and test themselves.

Built with Node.js, Express, MongoDB, and Google's Gemini AI, featuring a from-scratch **Retrieval-Augmented Generation (RAG)** pipeline using MongoDB Atlas Vector Search.

---

## Features

- **Authentication** — email/password registration with email OTP verification, login, JWT access + refresh tokens (with rotation), forgot/reset password, logout, and Google OAuth.
- **Notes** — full CRUD for user-written notes.
- **Documents** — upload PDFs, DOCX, and images; automatic text extraction; files stored on Cloudinary.
- **AI Summaries** — generate structured study summaries (overview, sectioned breakdown, key points) from any note or document. Cached to avoid redundant AI calls.
- **AI Quizzes** — generate multiple-choice quizzes with a cheat-proof take/submit flow: answers are hidden while taking, revealed only after server-side grading. Attempts are stored for progress tracking.
- **AI Flashcards** — generate front/back flashcard sets for active recall. Cached per source.
- **AI Chat (RAG)** — chat with a document. Uses a full RAG pipeline: chunking, Gemini embeddings, MongoDB Atlas Vector Search retrieval, and context-grounded generation with conversation memory and hallucination guardrails.
- **Study Planner** — create study tasks with due dates and completion status, with optional status filtering.
- **Analytics** — a dashboard aggregating content counts, planner progress, and quiz performance over time.
- **Security** — bcrypt password hashing, JWT auth middleware, per-endpoint rate limiting (strict on auth and AI routes), CORS, and input validation.

---

## Tech Stack

| Layer         | Technology                                                |
| ------------- | --------------------------------------------------------- |
| Runtime       | Node.js                                                   |
| Framework     | Express                                                   |
| Database      | MongoDB (Mongoose)                                        |
| Vector Search | MongoDB Atlas Vector Search                               |
| Auth          | JWT (access + refresh), bcrypt                            |
| AI            | Google Gemini (`@google/genai`) — generation + embeddings |
| File Storage  | Cloudinary                                                |
| Email         | Resend                                                    |
| File Handling | Multer, pdf-parse, mammoth                                |
| Rate Limiting | express-rate-limit                                        |

---

## RAG Pipeline

The AI chat feature implements retrieval-augmented generation end to end:

1. **Chunking** — on upload, a document's extracted text is split into overlapping chunks.
2. **Embedding** — each chunk is embedded into a 768-dimension vector via Gemini (`gemini-embedding-001`), normalized for cosine similarity.
3. **Storage** — chunks + vectors are stored in a dedicated collection indexed by MongoDB Atlas Vector Search.
4. **Retrieval** — at chat time, the question is embedded and the most relevant chunks are retrieved via `$vectorSearch`, scoped to the user and document.
5. **Generation** — retrieved chunks + recent conversation history are sent to Gemini, which answers strictly from the provided context (and admits when an answer isn't in the material).

---

## Architecture

```
src/
├── config/         # DB connection
├── models/         # Mongoose schemas
├── controllers/    # Request handling & business logic
├── routes/         # Route definitions
├── middleware/     # Auth, rate limiting, file upload
├── utils/          # Cloudinary, Gemini, embeddings, chunking, retrieval, email
├── app.js          # Express app setup
└── index.js        # Entry point
```

Key patterns:

- **Owner-scoped queries** — every resource is tied to a user; all queries filter by owner so users only access their own data.
- **Polymorphic references** — summaries, quizzes, and flashcards can each be generated from either a note or a document.
- **Database-as-cache** — AI summaries and flashcards are stored and reused on repeat requests to protect API quota.

---

## API Overview

Base URL: `/api/v1`

| Group      | Base Path     |
| ---------- | ------------- |
| Auth       | `/auth`       |
| Notes      | `/notes`      |
| Documents  | `/documents`  |
| Summaries  | `/summaries`  |
| Quizzes    | `/quizzes`    |
| Flashcards | `/flashcards` |
| Chat (RAG) | `/chat`       |
| Planner    | `/planner`    |
| Analytics  | `/analytics`  |

All feature routes require a Bearer access token. AI routes are additionally rate-limited.

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas cluster (with a Vector Search index on the `documentchunks` collection)
- Cloudinary, Resend, and Google Gemini API accounts

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/studysphere-backend.git
cd studysphere-backend
npm install
```

### Environment Variables

Create a `.env` file in the root:

```
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=your_frontend_origin

JWT_ACCESS_TOKEN_SECRET=your_access_secret
JWT_ACCESS_TOKEN_EXPIRY=1d
JWT_REFRESH_TOKEN_SECRET=your_refresh_secret
JWT_REFRESH_TOKEN_EXPIRY=10d

RESEND_API_KEY=your_resend_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GEMINI_API_KEY=your_gemini_key

GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
```

### Atlas Vector Search Index

Create a vector search index named `vector_index` on the `documentchunks` collection:

```json
{
    "fields": [
        {
            "type": "vector",
            "path": "embedding",
            "numDimensions": 768,
            "similarity": "cosine"
        },
        { "type": "filter", "path": "owner" },
        { "type": "filter", "path": "document" }
    ]
}
```

### Run

```bash
npm run dev     # development (nodemon)
npm start       # production
```

---

## Roadmap

- [ ] Push notifications (FCM) with deep linking
- [ ] Free / Premium subscription tiers with usage limits
- [ ] Background job queue for document processing
- [ ] React Native mobile app

---

## License

This project is for educational and portfolio purposes.
