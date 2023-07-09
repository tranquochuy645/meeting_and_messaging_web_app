import socketIO from "socket.io";
import { Server as HTTPServer } from "http";
import { verifyTokenViaSocketIO } from "../../middleware/socketIO/jwt";
import { onlineCheck } from "../../lib/onlineCheck";

const setupSocketIO = (server: HTTPServer) => {
  const io = new socketIO.Server(server);
  io.use(verifyTokenViaSocketIO);

  // Set up event handlers for socket connections
  io.on("connection", async (socket) => {
    try {
      const userId = socket?.handshake?.headers?.userId;
      if (!userId || typeof userId !== "string") {
        socket.emit("error", { message: "Invalid user" });
        socket.disconnect();
        return;
      }
      
      await onlineCheck(userId,socket.id, true);
      console.log("A user connected");

      // Handle custom events
      socket.on("message", (message) => {
        console.log("Received message:", message);
      });

      socket.on("disconnect", async () => {
        console.log("A user disconnected");
        try {
          await onlineCheck(userId,socket.id, false);
        } catch (error) {
          console.error(error);
        }
      });
    } catch (error) {
      console.error(error);
      socket.emit("error", { message: "Internal Server Error" });
      socket.disconnect();
    }
  });
};

export { setupSocketIO };
