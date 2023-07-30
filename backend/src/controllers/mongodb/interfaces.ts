import { ObjectId, WithId } from "mongodb";
export interface Message {
    sender: string;
    content: string;
    timestamp: string;
    urls: string[];
}

export interface ReadCursor {
    _id: string;
    lastReadTimeStamp: string;
}

export interface ConversationData extends WithId<Document> {
    messages: Message[];
    readCursors: ReadCursor[];
    conversationLength: number;
}

export interface RoomParticipant {
    _id: ObjectId;
    fullname: string;
    avatar: string;
    isOnline: boolean;
    bio?: string; // Optional field, as it might not be present in all participants
}

export interface Room {
    _id: ObjectId;
    participants: RoomParticipant[];
    type: string; // 'global' or 'defautt'
    isMeeting: boolean;
    meeting_uuid: string | null;
    lastReadTimeStamp: Date | null;
    latestMessage: {} | null;
}

// Define the array of Room objects
export interface RoomList extends Array<Room> { }

