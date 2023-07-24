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
    fullname: string,
    avatar: string,
    isOnline: boolean,
    invitations: ObjectId[],
    rooms: ObjectId[],
    createdAt: Date
  ) {
    this.username = username;
    this.password = password;
    this.fullname = fullname;
    this.avatar = avatar;
    this.isOnline = isOnline;
    this.invitations = invitations;
    this.rooms = rooms;
    this.createdAt = createdAt;
  }
}

export default User;
