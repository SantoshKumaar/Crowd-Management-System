import { io } from "socket.io-client";
import { Constants } from "../config/Constants";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://hiring-dev.internal.kloudspot.com";

let socket = null;

export const SocketService = {

  connect: (token) => {
    if (socket?.connected) {
      return socket;
    }

    socket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    return socket;
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  subscribeToAlerts: (callback) => {
    if (!socket) return;

    socket.on(Constants.SOCKET_EVENTS.ALERT, (data) => {
      callback(data);
    });

    return () => {
      if (socket) {
        socket.off(Constants.SOCKET_EVENTS.ALERT);
      }
    };
  },

  subscribeToLiveOccupancy: (callback) => {
    if (!socket) return;

    socket.on(Constants.SOCKET_EVENTS.LIVE_OCCUPANCY, (data) => {
      callback(data);
    });

    return () => {
      if (socket) {
        socket.off(Constants.SOCKET_EVENTS.LIVE_OCCUPANCY);
      }
    };
  },
};

export default socket;



