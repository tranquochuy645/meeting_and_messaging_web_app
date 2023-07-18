import { Collection, Filter, ObjectId, UpdateDescription, UpdateFilter } from "mongodb";

class UsersController {
    private _collection: Collection | null;

    constructor() {
        this._collection = null;
    }
    set ref(ref: Collection) {
        this._collection = ref;
    }
    public async checkAvailableUserName(username: string) {
        const result = await this._collection?.findOne({ username })
        return !result
    }
    public createUser(newUser: any) {
        return this._collection?.insertOne(newUser);
    }
    public readProfile(id: string) {
        return this._collection?.findOne(
            { _id: new ObjectId(id) },
            { projection: { password: 0 } }
        )
    }
    public readShortProfile(id: string) {
        return this._collection?.findOne(
            { _id: new ObjectId(id) },
            {
                projection:
                {
                    fullname: 1,
                    avatar: 1,
                    isOnline: 1,
                }
            }
        )
    }
    public readManyShortProfiles(filter: any) {
        return this._collection?.find(
            filter,
            {
                projection:
                {
                    fullname: 1,
                    avatar: 1,
                    isOnline: 1,
                }
            }
        ).toArray();
    }
    public updateUser(id: string, data: any) {
        return this._collection?.updateOne({ _id: new ObjectId(id) }, { $set: data });
    }
    public deleteUser(id: string) {
        // TODO: delete user
    }
    public getPassword(username: string) {
        return this._collection?.findOne(
            { username: username },
            { projection: { password: 1 } }
        )
    }
    public setStatus(id: string, isOnline: boolean) {
        return this._collection?.updateOne(
            { _id: new ObjectId(id) },
            { $set: { isOnline: isOnline, lastUpdate: new Date() } }
        )
    }
    public getRooms(id: string) {
        return this._collection?.findOne(
            { _id: new ObjectId(id) },
            { projection: { _id: 0, rooms: 1 } }
        )
    }
    public async pullFromInvitaionList(userId: string, roomId: string) {
        try {
            const result = await this._collection?.updateOne(
                { _id: new ObjectId(userId) },
                {
                    $pull: { invitations: new ObjectId(roomId) }
                }
            );
            return result?.modifiedCount
        } catch (e) {
            throw e
        }
    }
    public async joinRoom(userId: string, roomId: string) {
        try {
            const result = await this._collection?.updateOne(
                { _id: new ObjectId(userId) },
                {
                    $push: { rooms: new ObjectId(roomId) },
                    $pull: { invitations: new ObjectId(roomId) }
                }
            );
            return result?.modifiedCount
        } catch (e) {
            throw e
        }
    }
    public leaveRoom(userId: string, roomId: string) {
        return this._collection?.updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { rooms: new ObjectId(roomId) } }
        )
    }
    public search(whoSearch: string, query: string, limit: number) {
        return this._collection?.find(
            {
                fullname: new RegExp(query, "i"),
                _id: { $ne: new ObjectId(whoSearch) }
            },
            { projection: { _id: 1, fullname: 1, avatar: 1 } }
        ).limit(limit).toArray();
    }
    public async updateMany(filter: any, update: any) {
        try {
            const result = await this._collection?.updateMany(filter, update);
            return result?.modifiedCount
        } catch (e) {
            throw e;
        }
    }
}
const users = new UsersController();
export { users }
