import {response, Response } from "express";

/**
 * Add success response
 * @param {number} httpStatusCode 
 * @param {string} message 
 * @param {unknown} data 
 * @returns Response
 */
response.customSuccess = function (httpStatusCode: number, message: string, data: unknown = null): Response {
  return this.status(httpStatusCode).json({ message, data });
};
