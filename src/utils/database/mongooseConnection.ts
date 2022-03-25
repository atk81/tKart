import mongoose from "mongoose";
import { logger } from "../../logger";
import { CustomError } from "../response/error";

/**
 * @description Mongoose connection
 */
export default class MongooseConnection {
    public uri: string;
    /**
     * Mongoose connection constructor
     * @param uri MongoDB URI
     */
    constructor(uri: string) {
        this.uri = uri;
    }

    /**
     * @description Connect to MongoDB
     * @returns {Promise<void>}
     * @memberof MongooseConnection
     */
    public async connect(): Promise<void> {
        await this.connectWithRetry(this.uri, 10);
    }

    /**
     * @description Disconnect from MongoDB
     * @returns {Promise<void>}
     * @memberof MongooseConnection
     */
    public async disconnect(): Promise<void> {
        await mongoose.disconnect();
    }
    
    private async connectWithRetry(uri: string, retryCount: number): Promise<void> {
        try {
            await mongoose.connect(uri);
            logger.info(`Connected to MongoDB at ${uri}`);
        } catch (err) {
            logger.error(`Error connecting to MongoDB at ${uri}`);
            if (retryCount > 0) {
                setTimeout(() => {
                    this.connectWithRetry(uri, retryCount - 1);
                }, 5000);
            } else {
                throw new CustomError(500, "Application", "DATABASE_CONNECTION_ERROR", ["Error connecting to MongoDB"]);
            }
        }
    }
}
