const path = require('path');
const winston = require('winston');
require('winston-daily-rotate-file');
const moment = require('moment');
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.simple(),
  winston.format.splat(),
  winston.format.printf(
    (msg) =>
      `[${msg.level}] ${moment
        .utc(msg.timestamp)
        .format('DD/MM/YYYY hh:mm:ss')} ${msg.message}`
  )
);
/**
 * Set initial settings of winston module to create log on server.
 */
const transport = new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, '../public/logs/semrush-%DATE%.log'),
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: false,
  maxSize: '500k',
  maxFiles: '7d', // Auto delete the log after 7 days
});
/**
 * Create the winston instance to log the www.semrush.com-related activities.
 */
const semrushLog = winston.createLogger({
  format: productionFormat,
  transports: [transport],
});
/**
 * Create the winston instance to log the nodeapp-related activities.
 */
const serverLog = winston.createLogger({
  format: productionFormat,
  transports: [
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, '../public/logs/server-%DATE%.log'),
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: false,
      maxSize: '500k',
      maxFiles: '7d', // Auto delete the log after 7 days
    }),
  ],
});

module.exports = {
  semrushLog,
  serverLog
};
