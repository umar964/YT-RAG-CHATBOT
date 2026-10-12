
import { fetchTranscript } from "youtube-transcript";

/**
 * Extracts the 11-character video ID from a YouTube URL.
 */
export function extractYouTubeVideoId(url: string): string {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error("Please provide a valid YouTube URL.");
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  let videoId: string | null = null;

  if (hostname === "youtu.be" || hostname === "www.youtu.be") {
    videoId = parsedUrl.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (
    hostname === "youtube.com" ||
    hostname.endsWith(".youtube.com")
  ) {
    if (parsedUrl.pathname === "/watch") {
      videoId = parsedUrl.searchParams.get("v");
    } else {
      const match = parsedUrl.pathname.match(
        /^\/(?:embed|shorts|live)\/([^/]+)/
      );

      videoId = match?.[1] ?? null;
    }
  }

  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    throw new Error("The URL does not contain a valid YouTube video ID.");
  }

  return videoId;
}

/**
 * Fetches a YouTube video's transcript and combines its captions into text.
 */
export async function getYouTubeTranscript(
  videoUrl: string
): Promise<string> {
  const videoId = extractYouTubeVideoId(videoUrl);

  try {
    const transcript = await fetchTranscript(videoId);

    const fullText = transcript
      .map((caption) => caption.text.trim())
      .filter((text) => text.length > 0)
      .join(" ");

    if (!fullText) {
      throw new Error("The transcript is empty.");
    }

    return fullText;
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "The transcript is empty.") {
      throw error;
    }

    throw new Error(
      `Could not fetch the YouTube transcript. Captions may be unavailable, or YouTube may have blocked the request. ${
        error instanceof Error ? error.message : ""
      }`
    );
  }
}
