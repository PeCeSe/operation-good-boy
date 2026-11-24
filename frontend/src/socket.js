import { io } from "socket.io-client";

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

// WebSocket first: during a rolling deploy two backends run side by side, and
// long-polling would bounce between them (no sticky sessions) and fail.
const socket = io(BACKEND_URL, { autoConnect: false, transports: ["websocket", "polling"] });

export default socket;
