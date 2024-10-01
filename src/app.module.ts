import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import * as cookieParser from 'cookie-parser';

// Modules
import { UsersModule } from './users/users.module';
import { PropertiesModule } from './properties/properties.module';

// Controllers
import { AppController } from './app.controller';

// Services
import { AppService } from './app.service';

// Entities
import { User } from './users/entities/user.entity';
import { Property } from './properties/entities/property.entity';
import { UserProperty } from './entities/user-property.entity';


@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: 'localhost',
			port: 5432,
			username: 'maxdiplo',
			password: '',
			entities: [User, Property, UserProperty],
			database: 'property_app',
			synchronize: true,
			logging: true
		}),
		UsersModule,
		PropertiesModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
