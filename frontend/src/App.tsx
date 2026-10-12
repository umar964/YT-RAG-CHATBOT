
import { useRef, useState } from "react";
import { sendChatQuery } from "./services/api";
import "./App.css";
import ReactMarkdown from "react-markdown";

function App() {
  const [videoUrl, setVideoUrl] = useState("");
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const queryRef = useRef<HTMLTextAreaElement>(null);

  function handleQueryChange(value: string) {
    setQuery(value);

    if (queryRef.current) {
      queryRef.current.style.height = "auto";
      queryRef.current.style.height =
        `${Math.min(queryRef.current.scrollHeight, 180)}px`;
    }
  }

  function clearQuery() {
    setQuery("");

    if (queryRef.current) {
      queryRef.current.style.height = "auto";
      queryRef.current.focus();
    }
  }

  async function handleSend() {
    setError("");

    if (!videoUrl.trim()) {
      setError("Please enter a YouTube video URL.");
      return;
    }

    if (!query.trim()) {
      setError("Please enter your question.");
      return;
    }

    setLoading(true);

    try {
      const result = await sendChatQuery(
        videoUrl.trim(),
        query.trim()
      );

      if (!result.success) {
        throw new Error(
          result.message || "Failed to process your question."
        );
      }

      setAnswer(
        result.data?.answer ??
          "The backend has not returned an AI-generated answer yet."
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-container">
      <header className="app-header">
        <div className="app-logo">Y</div>
        <div>
          <h1>YouTube RAG</h1>
          <p>Chat with any YouTube video</p>
        </div>
      </header>

      <section className="chat-area">
        {!answer && !loading && !error && (
          <div className="welcome-section">
            <h2>What would you like to know?</h2>
            <p>
              Add a YouTube video and ask anything about its content.
            </p>
          </div>
        )}

        {loading && (
          <div className="loading-message">
            <span className="loading-dot" />
            <p>Watching the video and preparing your answer...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button
              type="button"
              className="icon-button"
              aria-label="Dismiss error"
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        )}

        {answer && (
          <div className="answer-message">
            <div className="assistant-avatar">Y</div>
            <div className="answer-content">
              
              <div className="answer-text">
                <ReactMarkdown>{answer}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="input-panel">
        <div className="video-input">
          <span className="video-icon">▶</span>

          <input
            type="url"
            aria-label="YouTube video URL"
            placeholder="Paste YouTube video URL..."
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            disabled={loading}
          />

          {videoUrl && (
            <button
              type="button"
              className="icon-button clear-button"
              aria-label="Clear video URL"
              title="Clear video URL"
              onClick={() => setVideoUrl("")}
              disabled={loading}
            >
              ×
            </button>
          )}
        </div>

        <form
          className="question-input"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSend();
          }}
        >
          <textarea
            ref={queryRef}
            aria-label="Your question"
            placeholder="Ask anything about this video..."
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            disabled={loading}
            rows={1}
          />

          <div className="input-actions">
            {query && (
              <button
                type="button"
                className="icon-button clear-button"
                aria-label="Clear question"
                title="Clear question"
                onClick={clearQuery}
                disabled={loading}
              >
                ×
              </button>
            )}

            <button
              type="submit"
              className="send-button"
              disabled={loading || !videoUrl.trim() || !query.trim()}
              aria-label="Send question"
              title="Send question"
            >
              {loading ? (
                <span className="send-spinner" />
              ) : (
                <span className="send-arrow">↑</span>
              )}
            </button>
          </div>
        </form>

        <p className="input-hint">
          Answers are generated using the video's transcript.
        </p>
      </section>
    </main>
  );
}

export default App;
