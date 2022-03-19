import dotenv from 'dotenv';
import app from "./app";
import { logger } from './logger';
import { mongoClient } from './utils/database/databaseConnect';
import { Cloudinary } from './config/cloudinary.config';
import "./utils/response/success"; // Import customSuccess method

/**
 * Load environment variables from .env file,
 * If .env file is not found, load from .env.default file
 * .env file should be in root directory
 */
const result = dotenv.config();
if (result.error) {
    logger.error(result.error);
  dotenv.config({ path: '.env.default' });
}

/**
 * Database connection
 */
const mongoclient = mongoClient();
mongoclient.connect();

/**
 * Cloudinary configuration
 */
const cloudinary = Cloudinary.getInstance();
cloudinary.config();

/**
 * Listen on provided port, on all network interfaces.
 */
app.listen(process.env.PORT || 3000, () => {
    logger.info(`Server started on port ${process.env.PORT || 3000}`);
    if(process.env.NODE_ENV === 'development'){
        logger.info(`Swagger UI is available on http://localhost:${process.env.PORT || 3000}/api-docs`);
    }
});

/**
 * Handle Process close event
 */
process.on('SIGINT', () => {
    logger.warn('SIGINT signal received');
    mongoclient.disconnect();
    process.exit(0);
});
