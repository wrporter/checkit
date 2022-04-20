import type { FormatFn } from 'morgan';
import morgan from 'morgan';
import * as rfs from 'rotating-file-stream';
import path from 'path';

// Example log:
// 2022-04-13T15:02:14.835923579Z [access] {"clientIp":"199.204.164.130","httpVersion":"1.1","url":"/cat-offerings-api/v1/offerings/CO_EK7mD6LEx81ji8h/details?lang=en","method":"GET","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36 Edg/99.0.1150.36","referer":"https://navyfederalresearch.co1.qualtrics.com/catalog/projects","via":"23.54.79.9, 10.24.32.5, 100.72.106.170, 100.72.107.125:57256","transactionId":"257b2191-5fe3-4d57-a8a4-5b34469a6a4d","requestId":"d728b630-89a9-4c7b-b136-515cc250942f","authType":"UDS","brandId":"navyfederalresearch","userId":"UR_3dZNng03i7zwslM","status":200,"bytesIn":0,"bytes":290,"time":5.088756,"id":"catalog-get-offering-details"}

const setResponseBodyMiddleware = (req: any, res: any, next: any) => {
    const oldWrite = res.write,
        oldEnd = res.end,
        chunks: any = [];

    res.write = function (chunk: any) {
        chunks.push(Buffer.from(chunk));
        oldWrite.apply(res, arguments);
    };

    res.end = function (chunk: any) {
        if (chunk) {
            chunks.push(Buffer.from(chunk));
        }
        res.responseBodyReader = Buffer.concat(chunks).toString('utf8');
        oldEnd.apply(res, arguments);
    };

    next();
};

const encoder = new TextEncoder();
morgan.token('responseBody', (req, res: any) => {
    return JSON.stringify(encoder.encode(res.responseBodyReader || '').length);
});
morgan.token('transactionId', (req: any, res: any) => {
    return req.transactionContext?.transactionId;
});
morgan.token('requestId', (req: any, res: any) => {
    return req.transactionContext?.requestId;
});
morgan.token('parentRequestId', (req: any, res: any) => {
    return req.transactionContext?.parentRequestId;
});

function toNumber(value: string | undefined): number {
    return Number.parseInt(value || '0');
}

const format: FormatFn = (tokens, req, res) => {
    const fields = {
        // Required
        url: tokens['url'](req, res),
        status: toNumber(tokens['status'](req, res)),
        time: toNumber(tokens['total-time'](req, res)),
        // Tracing
        requestId: tokens['requestId'](req, res),
        transactionId: tokens['transactionId'](req, res),
        parentRequestId: tokens['parentRequestId'](req, res),
        // Recommended
        clientIp: tokens['remote-addr'](req, res),
        method: tokens['method'](req, res),
        userAgent: tokens['user-agent'](req, res),
        // Optional, but useful
        bytes: toNumber(tokens['responseBody'](req, res)),
        bytesIn: toNumber(tokens.req(req, res, 'content-length')),
        httpVersion: tokens['http-version'](req, res),
        referer: tokens['referrer'](req, res),
        xForwardedFor: tokens.req(req, res, 'x-forward-for'),
    };

    return tokens.date(req, res, 'iso') + ' [access] ' + JSON.stringify(fields);
};

const accessLogStream = rfs.createStream('access.log', {
    teeToStdout: process.env.NODE_ENV === 'development',
    size: '10M',
    maxFiles: 5,
    path: process.env.LOG_PATH || path.join(process.cwd(), 'logs'),
});

export const accessLogMiddleware = [
    setResponseBodyMiddleware,
    morgan(format, {
        stream: accessLogStream,
    }),
];
