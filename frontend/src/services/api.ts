import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not configured");
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface HealthResponse {
  success: boolean;
  message: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  data?: {
    answer?: string;
    transcript?: string;
    characterCount?: number;
    chunks?: string[];
    chunkCount?: number;
  };
}

export async function checkBackendHealth(): Promise<HealthResponse> {
  const response = await api.get<HealthResponse>("/api/health");
  return response.data;
}

export async function sendChatQuery(
  videoUrl: string,
  query: string
): Promise<ChatResponse> {
  try {
    const response = await api.post<ChatResponse>("/api/transcript", {
      videoUrl,
      query,
    });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(
          error.response.data?.message ??
            `Backend request failed with status ${error.response.status}`
        );
      }

      if (error.request) {
        throw new Error(
          "Cannot reach the backend. Check that the backend server is running on the configured API URL."
        );
      }
    }

    throw error;
  }
}