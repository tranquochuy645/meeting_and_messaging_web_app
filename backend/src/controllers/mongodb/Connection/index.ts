import { MongoClient, Db, DbOptions } from 'mongodb';

export default class DBConnection {
    private db: Db | null = null;
    private initPromise: Promise<void> | null = null;
    public constructor(
        mongo_uri: string,
        db_name: string,
        opts: DbOptions
    ) {
        this.initPromise = this.init(mongo_uri, db_name, opts);
        return this
    }
    private async init(
        mongo_uri: string,
        db_name: string,
        opts: DbOptions,
    ): Promise<void> {
        try {
            const client = await MongoClient.connect(mongo_uri, opts)
            this.db = client.db(db_name);
            if (!this.db) {
                throw new Error("Connection failed");
            }
            console.log("Connected to database");
            return
        } catch (e) {
            throw e
        }
    }
    public async getDb(): Promise<Db> {
        await this.initPromise;
        if (!this.db) {
            throw new Error('Database connection has not been established.');
        }
        return this.db;
    }
}


