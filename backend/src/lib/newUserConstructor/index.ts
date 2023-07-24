import { ObjectId } from "mongodb";
class User {
    username: string;
    password: string;
    fullname: string;
    avatar: string;
    isOnline: boolean;
    invitations: ObjectId[];
    rooms: ObjectId[];
    createdAt: Date;

    constructor(
        username: string,
        password: string,
    ) {
        this.username = username;
        this.password = password;
        this.fullname = username;
        this.avatar = "";
        this.isOnline = false;
        this.invitations = [];
        this.rooms = [];
        this.createdAt = new Date();
    }
}

export default User;
