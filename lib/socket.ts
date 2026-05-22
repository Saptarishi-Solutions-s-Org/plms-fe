import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let lastConnectError = "";
let activeToken = "";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || "";
const isDevelopment = process.env.NODE_ENV !== "production";

export type RealtimeScope =
  | "global"
  | "system-admin"
  | `org:${string}`
  | `role:${string}`
  | `user:${string}`;

export type RealtimeEvent<TData = unknown> = {
  type: string;
  scope: RealtimeScope;
  data?: TData;
  timestamp: number;
};

type RealtimeHandler<TData = unknown> = (event: RealtimeEvent<TData>) => void;
type SocketStatusHandler = (status: "connected" | "disconnected") => void;

const subscriptions = new Map<string, Set<RealtimeHandler>>();
const statusSubscriptions = new Set<SocketStatusHandler>();

function dispatchEvent(event: RealtimeEvent) {
  subscriptions.get(event.type)?.forEach((handler) => handler(event));
}

function dispatchStatus(status: "connected" | "disconnected") {
  statusSubscriptions.forEach((handler) => handler(status));
}

function logSocket(message: string, ...details: unknown[]) {
  if (!isDevelopment) return;
  console.log(message, ...details);
}

function warnSocket(message: string, ...details: unknown[]) {
  if (!isDevelopment) return;
  console.warn(message, ...details);
}

export function connectSocket(token: string) {
  if (!SOCKET_URL || !token) return null;

  if (socket?.connected && activeToken === token) return socket;

  if (socket) {
    const tokenChanged = activeToken !== token;
    activeToken = token;
    socket.auth = { token };

    if (tokenChanged && socket.connected) {
      socket.disconnect();
    }

    socket.connect();
    return socket;
  }

  activeToken = token;
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    lastConnectError = "";
    dispatchStatus("connected");
    logSocket("Socket connected", { url: SOCKET_URL, id: socket?.id });
  });

  socket.on("disconnect", () => {
    dispatchStatus("disconnected");
    logSocket("Socket disconnected", { url: SOCKET_URL });
  });

  socket.on("connect_error", (error) => {
    if (lastConnectError === error.message) return;
    lastConnectError = error.message;
    const socketError = error as Error & {
      description?: unknown;
      context?: unknown;
    };
    warnSocket("Socket connection failed:", {
      url: SOCKET_URL,
      message: socketError.message,
      description: socketError.description,
      context: socketError.context,
    });
  });

  socket.on("event", (event: RealtimeEvent) => {
    dispatchEvent(event);
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
  lastConnectError = "";
  activeToken = "";
  dispatchStatus("disconnected");
}

export function getSocket() {
  return socket;
}

export function subscribeRealtime<TData = unknown>(
  type: string,
  handler: RealtimeHandler<TData>,
) {
  const handlers = subscriptions.get(type) ?? new Set<RealtimeHandler>();
  handlers.add(handler as RealtimeHandler);
  subscriptions.set(type, handlers);

  return () => unsubscribeRealtime(type, handler);
}

export function unsubscribeRealtime<TData = unknown>(
  type: string,
  handler: RealtimeHandler<TData>,
) {
  const handlers = subscriptions.get(type);
  if (!handlers) return;

  handlers.delete(handler as RealtimeHandler);
  if (handlers.size === 0) subscriptions.delete(type);
}

export function onSocketStatus(handler: SocketStatusHandler) {
  statusSubscriptions.add(handler);
  return () => statusSubscriptions.delete(handler);
}
