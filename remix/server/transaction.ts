import type { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface TransactionContext {
    transactionId: string;
    requestId: string;
    parentRequestId?: string;
}

export const requestTransactionMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const transactionId = req.header('X-Transaction-ID') || uuidv4();
    const parentRequestId = req.header('X-Parent-Request-ID');
    const requestId = uuidv4();

    (
        req as Request & { transactionContext: TransactionContext }
    ).transactionContext = {
        transactionId,
        requestId,
        parentRequestId,
    };

    res.setHeader('X-Transaction-ID', transactionId);
    res.setHeader('X-Request-ID', requestId);

    next();
};
