import socketIO from "socket.io";
import { Server as HTTPServer } from "http";
import { verifyTokenViaSocketIO } from "../../middleware/socketIO/jwt";
import { onlineCheck } from "../../lib/onlineCheck";
import { saveMessage } from "../../lib/saveMessage";
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

      await onlineCheck(userId, socket.id, true);
      console.log("A user connected");

      // Handle custom events
      socket.on("msg", (msg) => {
        console.log("msg:", msg);
        io.to(msg[0]).emit("msg", [userId, msg[1], msg[2], msg[3]]);
        saveMessage(userId, msg[1], msg[2], msg[3]);
      });

      let stateListeners: string[]=[];
      socket.on("onl", (msg) => {
        console.log("onl:", msg);
        stateListeners = msg;
        io.to(stateListeners).emit("onl", [userId, socket.id]);

      });

      socket.on("disconnect", async () => {
        console.log("A user disconnected");
        stateListeners = stateListeners.filter(id => id != socket.id)
        console.log("off:", stateListeners);
        io.to(stateListeners).emit("off", [userId, socket.id]);
        try {
          await onlineCheck(userId, socket.id, false);
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
