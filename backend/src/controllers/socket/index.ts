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
  io.on("connection", async (socket) => {
    const userId = socket?.handshake?.headers?.userId;
    if (!userId || typeof userId !== "string") {
      socket.emit("error", { message: "Invalid user" });
      return socket.disconnect();
    }

    let rooms: string[];
    try {
      const user = await dc.users.getRooms(userId)
      rooms = user.rooms.map(
        (room: ObjectId) => room.toString()
      );
    } catch (e) {
      return socket.disconnect();
    }
    socket.join(userId);
    dc.users.setStatus(userId, true);
    socket.emit("ok");
    console.log("A user connected");
    // Handle join meeting event
    socket.on("join_meet", (initData: string[]) => {
      console.log("A user has joined meeting");

      //initData: [ original chat room id , meeting uuid]
      if (!initData || initData.length != 2
        || !initData[0] || !initData[1]
        || !rooms.includes(initData[0])
      ) {
        return socket.disconnect()
      }
      socket.join(initData[1]);

      socket.on("disconnect", () => {
        io.to(initData[1]).emit('off_peer', socket.id);
        //if there is still user in this meeting, return
        console.log(io.sockets.adapter.rooms.get(initData[1])?.size)
        if (io.sockets.adapter.rooms.get(initData[1])?.size) return
        //else if all users has left the meeting
        io.to(initData[0]).emit("end_meet");
        dc.rooms.setMeeting(initData[0]);
      })
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
      // When a user completed setup camera, they send "ok"
      // Announce that they have joined
      socket.to(initData[1]).emit('new_peer', socket.id);
      // Check if this is the first user in the meeting
      if (io.sockets.adapter.rooms.get(initData[1])?.size == 1) {
        //anounce the room
        console.log("first user")
        socket.to(initData[0]).emit("meet", [userId, initData[0], initData[1], new Date()]);

        // Set isMeeting to true and save uuid in db
        dc.rooms.setMeeting(initData[0], initData[1]);
      }
    });
    // Handle join chat event
    socket.on('join_chat', async () => {
      console.log("A user has joined chat");
      rooms && rooms.length > 0 && rooms.forEach(
        (room: string) => {
          socket.join(room)
        }
      )
      try {
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
        socket.on("meet", (msg) => {
          //msg: [room id, date]
          console.log("meet:", msg);
          const meeting_uuid = uuidv4();
          socket.emit("meet", [userId, msg[0], meeting_uuid]);

        });

        socket.on("disconnect", async () => {
          // If the user has other socket connected,return
          if (io.sockets.adapter.rooms.get(userId)?.size) return
          // All sockets of the user have been disconnected
          // Send offline signal to all rooms of the user
          rooms.forEach(
            room => io.to(room).emit("off", userId)
          )
          dc.users.setStatus(userId, false);

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
  const pipeline_update = [
    {
      $match: {
        'updateDescription.updatedFields': { $exists: true }
      }
    }
  ];

  const handleChange = (change: ChangeStreamDocument) => {
    try {
      if (change.operationType == "update") {
        // const regex = /^rooms(?:\.\d+)?$/;;
        const updatedFields = change.updateDescription.updatedFields || {};
        const userId = change.documentKey._id.toString();

        const joinEventRegex = /^rooms\.\d+$/;
        const joinedRoomKey = Object.keys(updatedFields).find(key => joinEventRegex.test(key))
        if (joinedRoomKey) {
          // if it matches the join regex then the user joined a new room
          const roomId = updatedFields[joinedRoomKey]?.toString()
          // send a signal for users in that room to refresh
          io.to(roomId).emit('room')
          // send a signal for the new user to refresh
          io.to(userId).emit('room')

          // emit the signal to the user before joining them the room's socket ids to avoid bugs
          // it won't duplicate the signal
          io.sockets.adapter.rooms.get(userId)?.forEach(
            // get all the socket ids of that user
            socketId => {
              //join those sockets to the room
              io.sockets.sockets.get(socketId)?.join(roomId)
            })

        }
        // if it doesn't match the join regex then the user left a room

        // TODO: when a user left a room in database,
        // must force the user to leave the socket.io room
        const invsRegex = /^invitations(?:\.\d+)?$/;
        if (Object.keys(updatedFields).some(key => invsRegex.test(key))) {
          // changes in invitations
          io.to(userId).emit('inv')
        }
      }
    } catch (error) {
      console.error(error);
    }
  }


  dc.watch("users", pipeline_update, handleChange);

};



export {
  setupSocketIO
};
