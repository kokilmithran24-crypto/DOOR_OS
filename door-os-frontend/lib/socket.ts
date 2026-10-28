import { io, Socket } from "socket.io-client";
import { getToken } from "./api";

let socket: Socket | null = null;

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  (typeof window !== "undefined" ? window.location.origin.replace(/:3000$/, ":4000") : "http://localhost:4000");

export function getSocket(): Socket | null {
  return socket;
}

export function initSocket(onRemoteEvent?: {
  onAppOpened?: (data: { payload: unknown; from: string; at: number }) => void;
  onWindowMoved?: (data: { payload: { id: string; x: number; y: number }; from: string; at: number }) => void;
  onDesktopSync?: (data: { payload: { theme?: "dark" | "light"; wallpaper?: number; openApps?: unknown[] }; from: string; at: number }) => void;
}): Socket | null {
  const token = getToken();
  if (!token) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("[Door OS Socket] Connected to real-time sync server");
  });

  socket.on("connect_error", (err) => {
    console.warn("[Door OS Socket] Connection failed:", err.message);
  });

  if (onRemoteEvent?.onAppOpened) {
    socket.on("app:opened", onRemoteEvent.onAppOpened);
  }
  if (onRemoteEvent?.onWindowMoved) {
    socket.on("window:moved", onRemoteEvent.onWindowMoved);
  }
  if (onRemoteEvent?.onDesktopSync) {
    socket.on("desktop:sync", onRemoteEvent.onDesktopSync);
  }

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function emitAppOpened(appId: string, title?: string): void {
  if (socket && socket.connected) {
    socket.emit("app:opened", { appId, title });
  }
}

export function emitWindowMoved(id: string, x: number, y: number): void {
  if (socket && socket.connected) {
    socket.emit("window:moved", { id, x, y });
  }
}

export function emitDesktopSync(state: { theme?: string; wallpaper?: number; openApps?: string[] }): void {
  if (socket && socket.connected) {
    socket.emit("desktop:sync", state);
  }
}
