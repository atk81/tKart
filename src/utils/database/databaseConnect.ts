import MongooseConnection from "./mongooseConnection"

/**
 * Get the Mongoose connection client
 * @returns {MongooseConnection} MongoClient instance
 */
const mongoClient = (): MongooseConnection => {
    // TODO: Change the URI to split into host and port
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

export {
    mongoClient
}
