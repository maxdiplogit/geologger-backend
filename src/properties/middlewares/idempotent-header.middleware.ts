import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { createHash } from 'crypto';


@Injectable()
export class IdempotentHeaderMiddleware implements NestMiddleware {
    use(req: Request, _: Response, next: NextFunction) {
        if (req.method === 'POST') {
            const hash = createHash('sha1');
            hash.update(JSON.stringify(req.body));
            req.headers['idempotency-key'] = hash.digest('hex');
            next();
        }
    }
}