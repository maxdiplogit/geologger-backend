import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

// Services
import { UsersService } from '../users/users.service';

// Entities
import { User } from '../../entities/user.entity';


const scrypt = promisify(_scrypt);


@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
    ) {}

    async register(username: string, email: string, password: string) {
        const users = await this.usersService.findByEmail(email);

        if (users.length) {
            throw new BadRequestException(`${ email } already in use`);
        }

        const salt = randomBytes(8).toString('hex');
        const hash = (await scrypt(password, salt, 32)) as Buffer;
        const result = salt + '.' + hash.toString('hex');

        return this.usersService.create(username, email, result);
    }

    async login(email: string, password: string) {
        const [ user ]: Array<User> = await this.usersService.findByEmail(email);

        if (!user) {
            throw new NotFoundException(`User with ${ email } not found`);
        }

        const [ salt, storedHash ] = user.password.split('.');

        const hash = (await scrypt(password, salt, 32)) as Buffer;

        if (hash.toString('hex') !== storedHash) {
            throw new BadRequestException(`Wrong password`);
        }

        const payload = {
            id: user.id,
            email: user.email,
        }
        const token = await this.usersService.encodeJWT(payload);

        return [user, token];
    }
}
