import dotenv from 'dotenv';
import winston from "winston";
import 'winston-daily-rotate-file';
const {combine, timestamp, json, colorize, align} = winston.format;
dotenv.config();
/**
 * Set level for winston based on NODE_ENV
 * @returns {string} level
 */
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'error';
}

/**
 * Using winston-daily-rotate-file to log to file
 * Automatically rotate log files every day
 * Delete old log files after 7 days
 * Max log file size is 20MB
 */
const transport = new winston.transports.DailyRotateFile({
  filename: 'application-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: false,
  maxSize: '20m',
  maxFiles: '7d'
});

const logger = winston.createLogger({
    level: level(),
    format: combine(timestamp({
        format: 'YYYY-MM-DD hh:mm:ss A', // 2022-01-25 03:23:10 PM
    }), json(), colorize({ all: true }),align()),
    transports: [ new winston.transports.Console(),
                  transport ],
    exceptionHandlers: [
    new winston.transports.File({ filename: 'exception.log' }),
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: 'rejections.log' }),
    ],
});

export {
    logger
};

