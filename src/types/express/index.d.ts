import "express"; // Modification of the global namespace Express
declare global{
    namespace Express{

        /**
         * Custom success response
         * @param httpStatusCode HTTP status code
         * @param message Message to be sent
         * @param data Data to be sent
         * @returns Response
         */
        export interface Response{
            customSuccess(httpStatusCode: number, message: string, data: unknown | null): Response;
        }

        export interface Request{
            user: IUser;
        }
    }
}
