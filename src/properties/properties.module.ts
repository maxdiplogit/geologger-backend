import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Modules
import { UsersModule } from '../users/users.module';

// Controllers
import { PropertiesController } from './properties/properties.controller';

// Services
import { PropertiesService } from './services/properties/properties.service';
import { SellerService } from './services/seller/seller.service';
import { BuyerService } from './services/buyer/buyer.service';

// Entities
import { UserProperty } from '../entities/user-property.entity';
import { Property } from './entities/property.entity';
import { IdempotentHeaderMiddleware } from './middlewares/idempotent-header.middleware';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			UserProperty,
			Property
		]),
		UsersModule,
	],
	controllers: [PropertiesController],
	providers: [
		PropertiesService,
		SellerService,
		BuyerService
	]
})
export class PropertiesModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(IdempotentHeaderMiddleware)
			.forRoutes(
				{ path: 'properties/create', method: RequestMethod.POST },
				{ path: 'properties/buy/:id', method: RequestMethod.POST },
			);
	}
}
