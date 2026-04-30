import { useRef, useCallback, useState, useEffect } from "react";
import { getCachedAudio, cacheAudio, base64ToObjectUrl } from "./adaptive/audioCache.js";

const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel

export function useElevenLabs(apiKey) {
  const audioRef = useRef(null);
  const abortRef = useRef(null);
  const [error, setError] = useState(null);
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(
    async (text) => {
      setError(null);

      if (abortRef.current) abortRef.current.abort();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      if (!apiKey) {
        setError("no api key");
        return null;
      }

      // check audio cache first
      const cached = await getCachedAudio(text);
      if (cached) {
        try {
          const url = base64ToObjectUrl(cached);
          const audio = new Audio(url);
          audioRef.current = audio;
          setSpeaking(true);
          audio.onended = () => setSpeaking(false);
          audio.onerror = () => setSpeaking(false);
          audio.play();
          return audio;
        } catch {
          // cache read failed, fall through to fetch
        }
      }

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        setSpeaking(true);
        const res = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
          {
            method: "POST",
            headers: {
              "xi-api-key": apiKey,
              "Content-Type": "application/json",
              Accept: "audio/mpeg",
            },
            body: JSON.stringify({
              text,
              model_id: "eleven_turbo_v2",
              voice_settings: { stability: 0.5, similarity_boost: 0.75 },
            }),
            signal: controller.signal,
          },
        );

        if (!res.ok) throw new Error(`tts failed (${res.status})`);

        const blob = await res.blob();
        if (controller.signal.aborted) return null;

        // cache for next time (fire and forget)
        cacheAudio(text, blob);

        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => setSpeaking(false);
        audio.onerror = () => setSpeaking(false);
        audio.play();

        return audio;
      } catch (err) {
        if (err.name === "AbortError") return null;
        setError(err.message || "tts failed");
        setSpeaking(false);
        return null;
      }
    },
    [apiKey],
  );

  const stop = useCallback(() => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setSpeaking(false);
  }, []);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  return { speak, stop, error, speaking };
}
