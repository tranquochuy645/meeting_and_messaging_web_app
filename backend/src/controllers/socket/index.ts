import socketIO from "socket.io";
import { Server as HTTPServer } from "http";
import { verifyTokenViaSocketIO } from "../../middlewares/socketIO/jwt";
import DatabaseController from "../mongodb";
import { ChangeStreamDocument, ObjectId } from "mongodb";
import { v4 as uuidv4 } from 'uuid';

export default class SocketIOController {
  private _io: any = null;
  public init(server: HTTPServer, dc: DatabaseController) {
    const io = new socketIO.Server(server);
    io.use(verifyTokenViaSocketIO);

    // Set up event handlers for socket connections
    io.on("connection", async (socket) => {
      const userId = socket?.handshake?.headers?.userId;
      if (!userId || typeof userId !== "string") {
        socket.emit("error", { message: "Invalid user" });
        return socket.disconnect();
      }

      let rooms: any[];
      try {
        rooms = await dc.users.getRoomsList(userId) || []
        rooms = rooms.map(room => room.toString())
        if (!rooms) {
          throw new Error()
        }
      } catch (e) {
        return socket.disconnect();
      }
      socket.join(userId);
      dc.users.setStatus(userId, true);
      socket.emit("ok");
      console.log("A user connected");
      // Handle join meeting event
      socket.on("join_meet", async (initData: string[]) => {

        //initData: [ original chat room id , meeting uuid]
        if (!initData || initData.length != 2
          || !initData[0] || !initData[1]
          || !rooms.includes(initData[0])
        ) {
          return socket.disconnect()
        }
        socket.join(initData[1]);
        console.log("A user has joined meeting");

        socket.on("disconnect", () => {
          io.to(initData[1]).emit('off_peer', socket.id);
          console.log("A user has left meeting");
          //if there is still user in this meeting, return
          console.log(io.sockets.adapter.rooms.get(initData[1])?.size)
          if (io.sockets.adapter.rooms.get(initData[1])?.size) return
          //else if all users has left the meeting
          io.to(initData[0]).emit("end_meet", initData);
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
        if (io.sockets.adapter.rooms.get(initData[1])?.size === 1) {
          const meetingState = await dc.rooms.checkMeeting(initData[0]);
          if (meetingState?.isMeeting === false && meetingState?.meeting_uuid === null) {
            //This is the first user in the meeting
            //anounce the room
            socket.to(initData[0]).emit("meet", [userId, initData[0], initData[1], new Date()]);
            // Set isMeeting to true and save uuid in db
            dc.rooms.setMeeting(initData[0], initData[1]);
          }
        }
      });
      // Handle join chat event
      socket.on('join_chat', async () => {
        console.log("A user has joined chat");
        rooms.length > 0 && rooms.forEach(
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
            //msg: [room id, content, date, [urls] ]
            console.log("msg:", msg);
            io.to(msg[0]).emit("msg", [userId, msg[0], msg[1], msg[2]], msg[3]);
            dc.rooms.saveMessage(userId, msg[0], msg[1], msg[2], msg[3]);
          });

          // Handle call event
          socket.on("meet", async (msg) => {
            //msg: [room id, date]
            console.log("meet:", msg);
            const meetingState = await dc.rooms.checkMeeting(msg[0])
            if (meetingState?.isMeeting && meetingState.meeting_uuid) {
              //Just tell the client to refresh because something went wrong
              //A meeting of that room is allready in progress
              return socket.emit("room")
            }
            //Init a new meeting
            const meeting_uuid = uuidv4();
            //Tell the client
            socket.emit("meet", [userId, msg[0], meeting_uuid]);

          });

          socket.on("disconnect", async () => {
            console.log("A user has left chat");
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
    const invitations_update_pipeline = [
      {
        $match: {
          'updateDescription.updatedFields.invitations': { $exists: true }
        }
      }
    ];

    const handleChange = (change: ChangeStreamDocument) => {
      try {
        if (change.operationType == "update") {
          const userId = change.documentKey._id.toString();
          io.to(userId).emit('inv')
        }
      } catch (error) {
        console.error(error);
      }
    }
    dc.watch("users", invitations_update_pipeline, handleChange);

    this._io = io;
  }


  public addToRoom(userId: string, roomId: string) {
    this._io.sockets.adapter.rooms.get(userId)?.forEach(
      // get all the socket ids of that user
      (socketId: string) => {
        //join those sockets to the room
        this._io.sockets.sockets.get(socketId)?.join(roomId)
      }
    )
  }

  public removeFromRoom(userId: string, roomId: string) {
    this._io.sockets.adapter.rooms.get(userId)?.forEach(
      // get all the socket ids of that user
      (socketId: string) => {
        //join those sockets to the room
        this._io.sockets.sockets.get(socketId)?.leave(roomId)
      }
    )
  }

  get io() {
    if (this._io)
      return this._io
    throw new Error("Socket io is not available")
  }
}
Object.freeze(SocketIOController);
const ioController = new SocketIOController();
export { ioController }