import winston, { transports, format } from 'winston';
import path from 'path';

const logger = winston.createLogger({
    silent: process.env.NODE_ENV === 'test',
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: format.combine(
        format.errors({ stack: true }),
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.Console(),
        new transports.File({
            maxsize: 10_000_000, // 10 MB
            maxFiles: 5,
            tailable: true,
            filename: path.join(
                process.env.LOG_PATH || path.join(process.cwd(), 'logs'),
                'event.log'
            ),
        }),
    ],
});

export default logger;
