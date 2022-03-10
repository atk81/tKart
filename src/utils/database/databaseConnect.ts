import MongooseConnection from "./mongooseConnection"
import RedisConnection from "./redisConnection";

/**
 * Get the Mongoose connection client
 * @returns {MongooseConnection} MongoClient instance
 */
const mongoClient = (): MongooseConnection => {
    let mongoClient: MongooseConnection;
    const defaultURI = "mongodb://localhost:27017/";
    if(process.env.NODE_ENV === 'production'){
        mongoClient = new MongooseConnection(process.env.MONGO_URI_PROD || defaultURI);
    } else if(process.env.NODE_ENV === 'test'){
        mongoClient = new MongooseConnection(process.env.MONGO_URI_TEST || defaultURI);
    } else {
        mongoClient = new MongooseConnection(process.env.MONGO_URI_LOCAL || defaultURI);
    }
    return mongoClient;
}

const redisClient = (): RedisConnection => {
    let redisClient: RedisConnection;
    const defaultURI = "redis://localhost:6379/";
    if(process.env.NODE_ENV === 'production'){
        redisClient = new RedisConnection(process.env.REDIS_URI_PROD || defaultURI);
    }
    else if(process.env.NODE_ENV === 'test'){
        redisClient = new RedisConnection(process.env.REDIS_URI_TEST || defaultURI);
    } else {
        redisClient = new RedisConnection(process.env.REDIS_URI_LOCAL || defaultURI);
    }
    return redisClient;
}

export {
    mongoClient,
    redisClient
}
