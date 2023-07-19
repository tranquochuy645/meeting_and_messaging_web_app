import socketIO from "socket.io";
import { Server as HTTPServer } from "http";
import { verifyTokenViaSocketIO } from "../../middlewares/socketIO/jwt";
import { chatAppDbController as dc } from "../mongodb";
import { ChangeStreamDocument, ObjectId } from "mongodb";
import { v4 as uuidv4 } from 'uuid';
const setupSocketIO = (server: HTTPServer) => {
  const io = new socketIO.Server(server);
  io.use(verifyTokenViaSocketIO);

  // Set up event handlers for socket connections
  io.on("connection", (socket) => {
    console.log("A user connected");
    // Handle join meeting event
    socket.on("join_meet", (uuid: string) => {
      console.log("A user has joined meeting");
      socket.join(uuid);
      socket.to(uuid).emit('new_peer', socket.id);
      socket.on('offer', (msg: any[]) => {
        //msg: [ target socket id, offer data]
        socket.to(msg[0]).emit('offer', [socket.id, msg[1]]);
      })
      socket.on('answer', (msg: any[]) => {
        //msg: [ target socket id, answer data]
        socket.to(msg[0]).emit('answer', [socket.id, msg[1]]);
      })
      socket.on('ice_candidate', (msg: any[]) => {
        //msg: [ target socket id, ice data]
        socket.to(msg[0]).emit('ice_candidate', [socket.id, msg[1]]);
      })
      socket.on("disconnect", () => {
        io.to(uuid).emit('off_peer', socket.id);
      })
    });
    // Handle join chat event
    socket.on('join_chat', async () => {
      console.log("A user has joined chat");
      try {
        const userId = socket?.handshake?.headers?.userId;
        if (!userId || typeof userId !== "string") {
          socket.emit("error", { message: "Invalid user" });
          socket.disconnect();
          return;
        }
        socket.join(userId);

        const user = await dc.users.getRooms(userId)

        const rooms: string[] = user?.rooms.map(
          (room: ObjectId) => room.toString()
        );
        rooms.length > 0 && rooms.forEach(
          (room: string) => {
            socket.join(room)
          }
        )
        if (!io.sockets.adapter.rooms.get(userId)?.size) {
          // if this socket is the first socket of the user
          await dc.users.setStatus(userId, true);
          //Send online signal to all rooms of the user
          rooms.forEach(
            room => socket.to(room).emit("onl", userId)
          )
        }
        // Handle message event
        socket.on("msg", (msg) => {
          //msg: [room id, content, date]
          console.log("msg:", msg);
          io.to(msg[0]).emit("msg", [userId, msg[0], msg[1], msg[2]]);
          dc.rooms.saveMessage(userId, msg[0], msg[1], msg[2]);
        });

        // Handle call event
        socket.on("call", (msg) => {
          //msg: [room id, date]
          console.log("call:", msg);
          const newRoomUUID = uuidv4();
          io.to(msg[0]).emit("call", [userId, newRoomUUID, msg[1]]);
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
            await dc.users.setStatus(userId, false);
          } catch (error) {
            console.error(error);
          }
        });

      } catch (error) {
        console.error(error);
        socket.emit("error", { message: "Internal Server Error" });
        socket.disconnect();
      }
    })
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    })
  });

  const handleRoomsChange = async (change: ChangeStreamDocument) => {
    try {
      if (change.operationType == "update") {
        const regex = /^participants(?:\.\d+)?$/;
        const joinEventRegex = /^participants\.\d+$/;
        const updatedFields = change.updateDescription.updatedFields || {};
        if (!Object.keys(updatedFields).some(key => regex.test(key))) {
          // not changes in participants
          return;
        }
        const roomId = change.documentKey._id.toString();
        const joinedPal = Object.keys(updatedFields).find(key => joinEventRegex.test(key))
        if (joinedPal) {
          // if it matches the join regex then a new user joined the room
          const user = updatedFields[joinedPal]?.toString()
          io.sockets.adapter.rooms.get(user)?.forEach(
            // get all the socket ids of that user
            socketId => {
              //join those sockets to the room
              io.sockets.sockets.get(socketId)?.join(roomId)
            })
        }
        // if it doesn't match the join regex then a user left the room

        // TODO: when a user left a room in database,
        // must force the user to leave the socket.io room

        // send a signal for users to refresh
        io.to(roomId).emit('room')
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

  dc.watch("rooms", pipeline_1, handleRoomsChange);

  const handleInvitationsChange = async (change: ChangeStreamDocument) => {
    try {
      if (change.operationType == "update") {
        const regex = /^invitations(?:\.\d+)?$/;
        const updatedFields = change.updateDescription.updatedFields || {};
        if (!Object.keys(updatedFields).some(key => regex.test(key))) {
          // not changes in invitations
          return;
        }
        const userId = change.documentKey._id.toString();
        io.to(userId).emit('inv')
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

  dc.watch("users", pipeline_2, handleInvitationsChange);
};



export {
  setupSocketIO
};
