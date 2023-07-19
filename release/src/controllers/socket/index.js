"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketIO = void 0;
const socket_io_1 = __importDefault(require("socket.io"));
const jwt_1 = require("../../middlewares/socketIO/jwt");
const mongodb_1 = require("../mongodb");
const uuid_1 = require("uuid");
const setupSocketIO = (server) => {
    const io = new socket_io_1.default.Server(server);
    io.use(jwt_1.verifyTokenViaSocketIO);
    // Set up event handlers for socket connections
    io.on("connection", (socket) => {
        console.log("A user connected");
        // Handle join meeting event
        socket.on("join_meet", (uuid) => {
            console.log("A user has joined meeting");
            socket.join(uuid);
            socket.to(uuid).emit('new_peer', socket.id);
            socket.on('offer', (msg) => {
                //msg: [ target socket id, offer data]
                socket.to(msg[0]).emit('offer', [socket.id, msg[1]]);
            });
            socket.on('answer', (msg) => {
                //msg: [ target socket id, answer data]
                socket.to(msg[0]).emit('answer', [socket.id, msg[1]]);
            });
            socket.on('ice_candidate', (msg) => {
                //msg: [ target socket id, ice data]
                socket.to(msg[0]).emit('ice_candidate', [socket.id, msg[1]]);
            });
            socket.on("disconnect", () => {
                io.to(uuid).emit('off_peer', socket.id);
            });
        });
        // Handle join chat event
        socket.on('join_chat', async () => {
            var _a, _b, _c;
            console.log("A user has joined chat");
            try {
                const userId = (_b = (_a = socket === null || socket === void 0 ? void 0 : socket.handshake) === null || _a === void 0 ? void 0 : _a.headers) === null || _b === void 0 ? void 0 : _b.userId;
                if (!userId || typeof userId !== "string") {
                    socket.emit("error", { message: "Invalid user" });
                    socket.disconnect();
                    return;
                }
                socket.join(userId);
                const user = await mongodb_1.chatAppDbController.users.getRooms(userId);
                const rooms = user === null || user === void 0 ? void 0 : user.rooms.map((room) => room.toString());
                rooms.length > 0 && rooms.forEach((room) => {
                    socket.join(room);
                });
                if (!((_c = io.sockets.adapter.rooms.get(userId)) === null || _c === void 0 ? void 0 : _c.size)) {
                    // if this socket is the first socket of the user
                    await mongodb_1.chatAppDbController.users.setStatus(userId, true);
                    //Send online signal to all rooms of the user
                    rooms.forEach(room => socket.to(room).emit("onl", userId));
                }
                // Handle message event
                socket.on("msg", (msg) => {
                    //msg: [room id, content, date]
                    console.log("msg:", msg);
                    io.to(msg[0]).emit("msg", [userId, msg[0], msg[1], msg[2]]);
                    mongodb_1.chatAppDbController.rooms.saveMessage(userId, msg[0], msg[1], msg[2]);
                });
                // Handle call event
                socket.on("call", (msg) => {
                    //msg: [room id, date]
                    console.log("call:", msg);
                    const newRoomUUID = (0, uuid_1.v4)();
                    io.to(msg[0]).emit("call", [userId, newRoomUUID, msg[1]]);
                });
                socket.on("disconnect", async () => {
                    var _a;
                    // If the user has other socket connected,return
                    if ((_a = io.sockets.adapter.rooms.get(userId)) === null || _a === void 0 ? void 0 : _a.size)
                        return;
                    // All sockets of the user have been disconnected
                    // Send offline signal to all rooms of the user
                    rooms.forEach(room => io.to(room).emit("off", userId));
                    try {
                        await mongodb_1.chatAppDbController.users.setStatus(userId, false);
                    }
                    catch (error) {
                        console.error(error);
                    }
                });
            }
            catch (error) {
                console.error(error);
                socket.emit("error", { message: "Internal Server Error" });
                socket.disconnect();
            }
        });
        socket.on("disconnect", () => {
            console.log("A user disconnected");
        });
    });
    const handleRoomsChange = async (change) => {
        var _a, _b;
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
                const joinedPal = Object.keys(updatedFields).find(key => joinEventRegex.test(key));
                if (joinedPal) {
                    // if it matches the join regex then a new user joined the room
                    const user = (_a = updatedFields[joinedPal]) === null || _a === void 0 ? void 0 : _a.toString();
                    (_b = io.sockets.adapter.rooms.get(user)) === null || _b === void 0 ? void 0 : _b.forEach(
                    // get all the socket ids of that user
                    socketId => {
                        var _a;
                        //join those sockets to the room
                        (_a = io.sockets.sockets.get(socketId)) === null || _a === void 0 ? void 0 : _a.join(roomId);
                    });
                }
                // if it doesn't match the join regex then a user left the room
                // TODO: when a user left a room in database,
                // must force the user to leave the socket.io room
                // send a signal for users to refresh
                io.to(roomId).emit('room');
            }
        }
        catch (error) {
            console.error(error);
        }
    };
    const pipeline_1 = [
        {
            $match: {
                'updateDescription.updatedFields': { $exists: true }
            }
        }
    ];
    mongodb_1.chatAppDbController.watch("rooms", pipeline_1, handleRoomsChange);
    const handleInvitationsChange = async (change) => {
        try {
            if (change.operationType == "update") {
                const regex = /^invitations(?:\.\d+)?$/;
                const updatedFields = change.updateDescription.updatedFields || {};
                if (!Object.keys(updatedFields).some(key => regex.test(key))) {
                    // not changes in invitations
                    return;
                }
                const userId = change.documentKey._id.toString();
                io.to(userId).emit('inv');
            }
        }
        catch (error) {
            console.error(error);
        }
    };
    const pipeline_2 = [{
            $match: {
                'updateDescription.updatedFields': { $exists: true }
            }
        }];
    mongodb_1.chatAppDbController.watch("users", pipeline_2, handleInvitationsChange);
};
exports.setupSocketIO = setupSocketIO;
