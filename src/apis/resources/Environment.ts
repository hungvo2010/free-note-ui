// Build the WebSocket endpoint based on Vite env vars and browser location.
// Supported env vars (set via Vite):
// - VITE_WS_URL: full WebSocket URL (wss://example.com/path). If set, used as-is.
// - VITE_WS_HOST: hostname (e.g., localhost)
// - VITE_WS_PORT: port (e.g., 8189)
// - VITE_WS_PATH: path (default "/freeNote")
// - VITE_WS_SECURE: "true" to force wss, otherwise auto from location.protocol
export const getRemoteUrl = (): string => {
  const env = (import.meta as any).env || {};

  // Prefer REACT_APP_* variables for compatibility
  const explicitUrl: string | undefined = env.REACT_APP_WS_URL || env.VITE_WS_URL;
  if (explicitUrl) return explicitUrl;

  const hasWindow = typeof window !== "undefined";
  const path = (env.REACT_APP_WS_PATH as string) || (env.VITE_WS_PATH as string) || "/freeNote";
  const secureFromEnv =
    String(env.REACT_APP_WS_SECURE || env.VITE_WS_SECURE || "").toLowerCase() === "true";
  const protocol = secureFromEnv
    ? "wss"
    : hasWindow && window.location.protocol === "https:"
    ? "wss"
    : "ws";

  const envHost = (env.REACT_APP_WS_HOST as string | undefined) || (env.VITE_WS_HOST as string | undefined);
  const envPort = (env.REACT_APP_WS_PORT as string | undefined) || (env.VITE_WS_PORT as string | undefined);

  let hostPort: string;
  if (envHost) {
    hostPort = envPort ? `${envHost}:${envPort}` : envHost;
  } else if (hasWindow) {
    hostPort = window.location.host; // includes port when present
  } else {
    hostPort = "localhost:8189";
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${protocol}://${hostPort}${normalizedPath}`;
};
