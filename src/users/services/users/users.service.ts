import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';

// Entities
import { User } from '../../entities/user.entity';

// DTOs
import { JwtPayloadDto } from 'src/users/dtos/jwt-payload.dto';


@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private usersRepository: Repository<User>
    ) {}

    create(username: string, email: string, password: string) {
        const user = this.usersRepository.create({ email, password });
        return this.usersRepository.save(user);
    }

    findByEmail(email: string) {
        return this.usersRepository.find({
            where: {
                email: email,
            }
        });
    }

    findOneById(id: number) {
        if (!id) {
            return null;
        }

        return this.usersRepository.findOneBy({ id: id });
    }

    async update(id: number, attrs: Partial<User>) {
        const foundUser = await this.findOneById(id);

        if (!foundUser) {
            throw new NotFoundException(`User with ${ id } does not exist`);
        }

        Object.assign(foundUser, attrs);

        return this.usersRepository.save(foundUser);
    }

    async delete(id: number) {
        const foundUser = await this.findOneById(id);

        if (!foundUser) {
            throw new NotFoundException(`User with ${ id } does not exist`);
        }

        return this.usersRepository.remove(foundUser);
    }

    async encodeJWT(payload: JwtPayloadDto) {
        try {
            const token = await jwt.sign({
                data: payload
            }, 'someSecretForNow', { expiresIn: '1m' });
    
            return token;
        } catch (err) {
            console.log(err);
            throw new BadRequestException(`JWT token invalid`);
        }
    }

    async decodeJWT(token: string) {
        try {
            const decoded = await jwt.verify(token, 'someSecretForNow');
    
            return decoded;
        } catch (err) {
            throw new BadRequestException(`JWT token invalid`);
        }
    }
}
