import socketIO from "socket.io";
import { Server as HTTPServer } from "http";
import { verifyTokenViaSocketIO } from "../../middleware/socketIO/jwt";
import { onlineCheck } from "../../lib/onlineCheck";
import { saveMessage } from "../../lib/saveMessage";
import { createWatcher, getDocuments } from "../mongodb";
import { ChangeStreamDocument } from "mongodb";

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

      let stateListeners: string[] = [];
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

  const handleRoomsChange = async (change: ChangeStreamDocument) => {
    try {
      if (change.operationType == "update") {
        const regex = /^participants(?:\.\d+)?$/;
        const updatedFields = change.updateDescription.updatedFields || {};
        if (!Object.keys(updatedFields).some(key => regex.test(key))) {
          // not changes in participants
          return;
        }
        const roomInfo = await getDocuments('rooms', change.documentKey, { projection: { _id: 0, participants: 1 } });
        const participantIds = roomInfo[0].participants;
        const participants = await getDocuments(
          'users',
          { _id: { $in: participantIds } },
          { projection: { _id: 0, socketId: 1 } }
        )
        const socketIds = participants.map(
          participant => {
            return participant.socketId;
          }
        ).flat()
        if (socketIds.length > 0) {
          console.log(socketIds);
          io.to(socketIds).emit('room')
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  const pipeline_1 = [
    {
      $match: {
        'updateDescription.updatedFields': { $exists: true }
      }
    }
  ];

  createWatcher("rooms", pipeline_1, handleRoomsChange);

  const handleInvitationsChange = async (change: ChangeStreamDocument) => {
    try {
      if (change.operationType == "update") {
        const regex = /^invitations(?:\.\d+)?$/;
        const updatedFields = change.updateDescription.updatedFields || {};
        if (!Object.keys(updatedFields).some(key => regex.test(key))) {
          // not changes in invitations
          return;
        }
        const result = await getDocuments("users", change.documentKey, { projection: { socketId: 1 } })
        if (result.length == 0) { return }
        const socketIds = result[0].socketId;
        if (socketIds.length == 0) { return }
        io.to(socketIds).emit('inv')
      }
    } catch (error) {
      console.error(error);
    }
  }
  const pipeline_2 = [{
    $match: {
      'updateDescription.updatedFields': { $exists: true }
    }
  }]

  createWatcher("users", pipeline_2, handleInvitationsChange);
};

export { setupSocketIO };
