import socketIO from "socket.io";
import { Server as HTTPServer } from "http";
import { verifyTokenViaSocketIO } from "../../middleware/socketIO/jwt";
import { onlineCheck } from "../../lib/onlineCheck";
import { saveMessage } from "../../lib/saveMessage";
import { createWatcher, getDocuments } from "../mongodb";
import { ChangeStreamDocument, ObjectId } from "mongodb";

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
      console.log("A user connected");

      const user = await getDocuments("users",
        { _id: new ObjectId(userId) },
        { projection: { _id: 0, rooms: 1 } }
      )
      if (user.length > 0) {
        const rooms: string[] = user[0].rooms.map(
          (room: ObjectId) => room.toString()
        );
        rooms.forEach(
          (room: string) => {
            socket.join(room)
          }
        )
        if (!io.sockets.adapter.rooms.get(userId)?.size) {
          // if this socket is the first socket of the user
          await onlineCheck(userId, true);
          //Send online signal to all rooms of the user
          rooms.forEach(
            room => socket.to(room).emit("onl", userId)
          )
        }
        socket.join(userId);
        // Handle message event
        socket.on("msg", (msg) => {
          //msg: [room id, content, date]
          console.log("msg:", msg);
          io.to(msg[0]).emit("msg", [userId, msg[0], msg[1], msg[2]]);
          saveMessage(userId, msg[0], msg[1], msg[2]);
        });

        // Handle call event
        socket.on("call", (msg) => {
          //msg: [room id, date]
          console.log("call:", msg);
          io.to(msg[0]).emit("call", [userId, msg[1]]);
        });


        socket.on("disconnect", async () => {
          // If the user has other socket connected,return
          if (io.sockets.adapter.rooms.get(userId)?.size) return
          // All sockets of the user have been disconnected
          // Send offline signal to all rooms of the user
          rooms.forEach(
            room => io.to(room).emit("off", userId)
          )
          try {
            await onlineCheck(userId, false);
          } catch (error) {
            console.error(error);
          }
        });
      }
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
