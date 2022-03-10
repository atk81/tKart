import dotenv from 'dotenv';
import express, { Response } from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import {logger} from './logger';
import { errorHandler } from './middleware/errorHandler';
import morganMiddleware from './morgan';
import { mongoClient, redisClient } from './utils/database/databaseConnect';
import { CustomError } from './utils/response/error';
import "./utils/response/success"; // Import customSuccess method
/**
 * Load environment variables from .env file,
 * If .env file is not found, load from .env.default file
 * .env file should be in root directory
 */
const result = dotenv.config();
if (result.error) {
    console.error(result.error);
  dotenv.config({ path: '.env.default' });
}

const app = express();

/**
 * Load the morgan middleware
 */
app.use(morganMiddleware);

/**
 * Load Swagger
 */

const swaggerDocument = (YAML.load(path.resolve(__dirname,"../openAPI/openapi.yaml")));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res: Response) => {
    res.customSuccess(200, 'Hello World', null);
});

app.get('/errors', (req, res, next)=>{
    const error = new CustomError(500, "Application", 'INTERNAL_SERVER_ERROR', [{
        message: "Something went wrong",
    }]);
    next(error);
});

app.get('*', (req, res, next)=>{
    const error = new CustomError(404, "General", 'NOT_FOUND', [{
        message: "Page not found",
    }]);
    next(error);
});

/**
 * Load the error handler middleware
 */
app.use(errorHandler);

/**
 * Database connection
 */
const mongoclient = mongoClient();
mongoclient.connect();
const redisclient = redisClient();
redisclient.connect();

/**
 * Listen on provided port, on all network interfaces.
 */
app.listen(process.env.PORT || 3000, () => {
    logger.info(`Server started on port ${process.env.PORT || 3000}`);
    
});

/**
 * Handle Process close event
 */
process.on('SIGINT', () => {
    logger.warn('SIGINT signal received. Closing Mongoose connection');
    // mongoclient.disconnect();
    process.exit(0);
});

export default app;
