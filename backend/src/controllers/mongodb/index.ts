import DatabaseSetup from './Setup';
import DBConnection from './Connection';
import { DbOptions, Db } from 'mongodb';
import { UsersController, RoomsController, MeetingsController } from './CRUD';

class Controller extends DatabaseSetup {
  private connection: DBConnection;
  private db: Db | undefined;
  private _users: UsersController | undefined;
  private _rooms: RoomsController | undefined;
  private _meetings: MeetingsController | undefined;

  constructor(mongo_uri: string, db_name: string, opts: DbOptions) {
    super();
    this.connection = new DBConnection(mongo_uri, db_name, opts);
  }

  public async init() {
    this.db = await this.connection.getDb();
    await this.setup(this.db);
    this._users = new UsersController(this.db.collection("users"));
    this._rooms = new RoomsController(this.db.collection("rooms"));
    this._meetings = new MeetingsController(this.db.collection("meetings"));
  }

  public createWatcher(
    collectionName: string,
    pipeline: Array<any> = [],
    callback: (change: any) => void
  ) {
    if (!this.db) throw new Error("DB NOT INITIALIZED");
    const changeStream = this.db.collection(collectionName).watch(pipeline);
    changeStream.on('change', callback);
  }

  public get users() {
    if (!this._users) throw new Error("USERS NOT INITIALIZED");
    return this._users;
  }

  public get rooms() {
    if (!this._rooms) throw new Error("ROOMS NOT INITIALIZED");
    return this._rooms;
  }

  public get meetings() {
    if (!this._meetings) throw new Error("MEETINGS NOT INITIALIZED");
    return this._meetings;
  }
}

export default Controller;
