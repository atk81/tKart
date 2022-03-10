import Redis from "ioredis";
import { logger } from "../../logger";

export default class RedisConnection {
    public uri: string;
    private redisClient: Redis.Redis | null;
    /**
     * Redis connection constructor
     */
    constructor(uri: string) {
        this.uri = uri;
        this.redisClient = null;
    }

    /**
     * @description Connect to Redis
     * @returns {Promise<void>}
     * @memberof RedisConnection
     */
    public async connect(): Promise<void> {
        try {
            this.redisClient = await new Redis(this.uri);
            logger.info(`Connected to Redis at ${this.uri}`);
        } catch(err){
            logger.error(`Error connecting to Redis at ${this.uri}`);
            throw new Error(`Error connecting to Redis at ${this.uri}`);
        }
    }

    /**
     * @description Disconnect from Redis
     */
    public async disconnect(): Promise<void> {
        try {
            if(this.redisClient){
                this.redisClient.quit();
                logger.warn("Disconnected from Redis");
            }
        } catch(err){
            logger.error("Error disconnecting from Redis");
            throw new Error("Error disconnecting from Redis");
        }
    }
}
