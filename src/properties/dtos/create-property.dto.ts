import { IsLatitude, IsLongitude, IsNumber, IsString, Max, Min } from "class-validator";


export class CreatePropertyDto {
    @IsString()
    name: string;

    @IsLatitude()
    latitude: number;

    @IsLongitude()
    longitude: number;

    @IsString()
    address: string;

    @IsNumber()
    @Min(0)
    @Max(100000000)
    price: number;
}