import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';

// Services
import { UsersService } from '../../users/services/users/users.service';
import { PropertiesService } from '../services/properties/properties.service';

// DTOs
import { JwtPayloadDto } from '../../users/dtos/jwt-payload.dto';
import { CreatePropertyDto } from '../dtos/create-property.dto';
import { UpdatePropertyDto } from '../dtos/update-property.dto';

// Decorators
import { CurrentUser } from '../../users/decorators/current-user.decorator';

// Guards
import { AuthGuard } from '../../guards/auth.guard';


@Controller('properties')
export class PropertiesController {
    constructor(
        private propertiesService: PropertiesService,
        private usersService: UsersService,
    ) {}

    @Get()
    homes() {
		return this.propertiesService.findAllProperties();
    }

    @Get('/:id')
    home(@Param('id') propertyId: string) {
        return this.propertiesService.findOneById(parseInt(propertyId));
    }

    @Post('/create')
    @UseGuards(AuthGuard)
    createProperty(@Body() body: CreatePropertyDto, @CurrentUser() currentUser: JwtPayloadDto, @Req() req: Request) {
        const userId = currentUser.id;
        const idempotencyKey = req.headers['idempotency-key'];

        return this.propertiesService.create(userId, body.name, body.address, body.latitude, body.longitude, body.price, idempotencyKey);
    }

    @Patch('/update/:id')
    @UseGuards(AuthGuard)
    updateProperty(@Param('id') propertyId: string, @CurrentUser() currentUser: JwtPayloadDto, @Body() body: UpdatePropertyDto) {
        const userId = currentUser.id;

        return this.propertiesService.update(parseInt(propertyId), userId, body)
    }

    @Delete('/delete/:id')
    @UseGuards(AuthGuard)
    deleteProperty(@Param('id') propertyId: string, @CurrentUser() currentUser: JwtPayloadDto) {
        const userId = currentUser.id;

        return this.propertiesService.delete(parseInt(propertyId), userId);
    }

    @Post('/buy/:id')
    @UseGuards(AuthGuard)
    buyProperty(@Param('id') propertyId: string, @CurrentUser() currentUser: JwtPayloadDto) {
        const userId = currentUser.id;

        return this.propertiesService.buyProperty(parseInt(propertyId), userId);
    }

    @Delete('/cancelPurchase/:id')
    @UseGuards(AuthGuard)
    cancelPurchase(@Param('id') propertyId: string, @CurrentUser() currentUser: JwtPayloadDto) {
        const userId = currentUser.id;

        return this.propertiesService.cancelPurchase(parseInt(propertyId), userId);
    }
}
