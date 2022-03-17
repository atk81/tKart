import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import morganMiddleware from "./morgan";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { apiRoutes } from "./routes";

const app = express();

/**
 * Load Swagger
 */
const swaggerDocument = (YAML.load(path.resolve(__dirname,"../openAPI/openapi.yaml")));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/**
 * Regulare Express middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Cookie parser and file upload middleware
 */
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

/**
 * Load the morgan middleware
 */
app.use(morganMiddleware);

/**
 * Load the routes
 */
app.use(apiRoutes);

/**
 * Load the error handler middleware
 */
app.use(errorHandler);

export default app;
