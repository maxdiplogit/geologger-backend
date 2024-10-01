import { Body, Controller, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';

// Services
import { AuthService } from '../services/auth/auth.service';

// DTOs
import { CreateUserDto } from '../dtos/create-user.dto';
import { LoginUserDto } from '../dtos/login-user.dto';
import { JwtPayloadDto } from '../dtos/jwt-payload.dto';
import { UserDto } from '../dtos/user.dto';

// Guards
import { AuthGuard } from 'src/guards/auth.guard';

// Decorators
import { CurrentUser } from '../decorators/current-user.decorator';

// Interceptor's Decorators
import { Serialize } from '../../interceptors/serialize.interceptor';


@Controller('users')
@Serialize(UserDto)
export class UsersController {
    constructor(
        private authService: AuthService
    ) {}

    @Post('/register')
    async registerUser(@Body() body: CreateUserDto) {
        const user = await this.authService.register(body.username, body.email, body.password);
        console.log(user);

        return user;
    }

    @Post('/login')
    async loginUser(@Body() body: LoginUserDto, @Res({ passthrough: true }) res: Response) {
        console.log(body);
        const [user, token] = await this.authService.login(body.email, body.password);
        console.log(user);
        
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 60000,
        });

        return user;
    }

    @Post('/logout')
    @UseGuards(AuthGuard)
    @HttpCode(204)
    async logoutUser(@CurrentUser() user: JwtPayloadDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
        res.clearCookie('jwt');

        return "Logged out successfully";
    }
}
