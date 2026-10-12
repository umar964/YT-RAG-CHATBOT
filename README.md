# YouTube RAG Chatbot — AI Video Assistant

An AI-powered chatbot that answers questions about YouTube videos using their transcripts. It retrieves relevant content from the video and uses Google's Gemini model to generate context-based answers.

## Features

- **Ask questions about videos:** Enter a YouTube URL and ask questions about its content.
- **Transcript-based answers:** Generates answers grounded in the video's transcript.
- **Retrieval-Augmented Generation (RAG):** Retrieves relevant transcript chunks before generating a response.
- **Semantic search:** Uses Gemini embeddings and FAISS to find relevant content.
- **Video caching:** Caches vector stores in memory to reduce repeated processing for the same video.
- **Markdown responses:** Displays formatted AI answers in a clean chat interface.

## Tech Stack

**Frontend**
- React.js
- TypeScript
- Vite
- Axios
- React Markdown

**Backend**
- Node.js
- Express.js
- TypeScript

**AI and Retrieval**
- Google Gemini
- Gemini Embeddings
- LangChain Text Splitter
- FAISS Vector Search
- YouTube Transcript Extraction

## How It Works

1. The user enters a YouTube video URL and a question.
2. The backend extracts the video's transcript.
3. The transcript is split into smaller chunks.
4. Gemini embeddings convert the chunks into vectors.
5. FAISS retrieves the most relevant chunks for the question.
6. Gemini generates an answer using the retrieved transcript content.

## Project Structure

```text
YT-RAG-CHATBOT/
├── backend/
│   └── src/
│       ├── routes/
│       ├── services/
│       ├── server.ts
│       └── ...
├── frontend/
│   └── src/
│       ├── services/
│       ├── App.tsx
│       ├── App.css
│       └── ...
└── .gitignore
```

## Getting Started

### Prerequisites

- Node.js and npm
- A Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/umar964/YT-RAG-CHATBOT.git
cd YT-RAG-CHATBOT
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Add any other environment variables required by your backend configuration.

### 3. Configure the frontend

Open a separate terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 4. Run the application

Start the backend using the development script defined in `backend/package.json`.

Start the frontend using:

```bash
npm run dev
```

Open the local URL shown by Vite in your terminal.

## Security

- Keep API keys in environment variables.
- Never commit `.env` files or expose API keys publicly.
- Use `.env.example` files for sharing required environment variable names without real secrets.

## Future Improvements

- Support chat history for each video.
- Improve transcript retrieval and answer quality.
- Add persistent caching for previously processed videos.
- Deploy the frontend and backend.

## Author

**Umar Rafiq**

- GitHub: [umar964](https://github.com/umar964)
- LinkedIn: [umar-rafiq019](https://www.linkedin.com/in/umar-rafiq019)
- LeetCode: [umar_rafiq019](https://leetcode.com/u/umar_rafiq019/)
