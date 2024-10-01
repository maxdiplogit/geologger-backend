import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { UsersController } from './users/users.controller';
import { PropertiesController } from '../properties/properties/properties.controller';

// Services
import { UsersService } from './services/users/users.service';
import { AuthService } from './services/auth/auth.service';

// Entities
import { User } from './entities/user.entity';

// Middlewares
import { CurrentUserMiddleware } from './middlewares/current-user.middleware';


@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
        ]),
    ],
    controllers: [UsersController],
    providers: [
        UsersService,
        AuthService,
    ],
    exports: [UsersService]
})
export class UsersModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(CurrentUserMiddleware)
            .forRoutes(
                { path: 'users/logout', method: RequestMethod.POST },
                { path: 'properties/', method: RequestMethod.GET },
                { path: 'properties/create', method: RequestMethod.POST },
                { path: 'properties/update/:id', method: RequestMethod.PATCH },
                { path: 'properties/delete/:id', method: RequestMethod.DELETE },
                { path: 'properties/buy/:id', method: RequestMethod.POST },
                { path: 'properties/cancelPurchase/:id', method: RequestMethod.DELETE },
            );
    }
}
