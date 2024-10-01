import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

// Services
import { UsersService } from "../services/users/users.service";

// DTOs
import { JwtPayload } from "jsonwebtoken";


declare global {
    namespace Express {
        interface Request {
            currentUser?: JwtPayload | string
        }
    }
};

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
    constructor (private usersService: UsersService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const cookies = req.cookies;
        console.log('Middleware: ', cookies);
        
        if (cookies['jwt']) {
            const decoded: any = await this.usersService.decodeJWT(cookies['jwt']);
            req.currentUser = decoded.data;
        }

        next();
    }
}