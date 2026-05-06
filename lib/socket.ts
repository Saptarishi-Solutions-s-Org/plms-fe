import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

type ServerEvent = {
  type: string;
  data: any;
  timestamp?: number;
};

export function connectSocket() {
  if (socket?.connected) {
    return socket;
  }

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string, {
    withCredentials: true,

    transports: ["websocket"],

    reconnection: true,

    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    console.log("Socket connected");
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  socket.on("event", (data: ServerEvent) => {
    console.log("📡 Realtime:", data);
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();

  socket = null;
}

export function getSocket() {
  return socket;
}
