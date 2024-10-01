import { IsEmail, IsNumber } from "class-validator";


export class JwtPayloadDto {
    @IsNumber()
    id: number;

    @IsEmail()
    email: string;
}