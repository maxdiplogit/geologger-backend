import { IsLatitude, IsLongitude, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";


export class UpdatePropertyDto {
    @IsString()
    @IsOptional()
    name: string;

    @IsLatitude()
    @IsOptional()
    latitude: number;

    @IsLongitude()
    @IsOptional()
    longitude: number;

    @IsString()
    @IsOptional()
    address: string;

    @IsNumber()
    @Min(0)
    @Max(100000000)
    @IsOptional()
    price: number;
}