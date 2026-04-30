// Audio cache — IndexedDB, keyed by question text.
// Stores audio as base64 so we don't call ElevenLabs for the same question twice.

const DB_NAME = "mq_audio_cache";
const STORE = "audio";
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE, { keyPath: "text" });
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

// returns base64 audio string or null
export async function getCachedAudio(text) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(text);
      req.onsuccess = () => resolve(req.result?.audio ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// stores a Blob as base64 for the given question text
export async function cacheAudio(text, blob) {
  try {
    const base64 = await blobToBase64(blob);
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put({ text, audio: base64, cachedAt: Date.now() });
      tx.oncomplete = resolve;
      tx.onerror = resolve; // silent fail
    });
  } catch {
    // silent fail — audio cache is best-effort
  }
}

// converts base64 back to an object URL for audio playback
export function base64ToObjectUrl(base64) {
  const binary = atob(base64.split(",")[1] ?? base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: "audio/mpeg" });
  return URL.createObjectURL(blob);
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function clearAudioCache() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
  } catch {}
}
