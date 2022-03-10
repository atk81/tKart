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
        try {
            await mongoose.connect(this.uri);
            logger.info(`Connected to MongoDB at ${this.uri}`);
        }catch(err){
            logger.error(`Error connecting to MongoDB at ${this.uri}`);
            throw new CustomError(500, "Application", "DATABASE_CONNECTION_ERROR", [{
                message: "Error connecting to MongoDB",
            }]);
        }
    }

    /**
     * @description Disconnect from MongoDB
     * @returns {Promise<void>}
     * @memberof MongooseConnection
     */
    public async disconnect(): Promise<void> {
        await mongoose.disconnect();
    }
}
