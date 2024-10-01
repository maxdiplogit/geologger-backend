import { CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Observable } from "rxjs";


export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest();

        console.log('GUARD: ', req.cookies, req.currentUser);
        if (!req.currentUser) {
            throw new ForbiddenException(`Current user undefined`);
        }

        return req.currentUser;
    }
}