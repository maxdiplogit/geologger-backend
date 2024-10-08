import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';

// Modules
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors({
		origin: 'http://localhost:3000',
		credentials: true,
		methods: 'GET, PUT, PATCH, HEAD, POST, DELETE',
		allowedHeaders: 'Content-Type, Access, Authorization'
	})
	app.use(cookieParser());
	await app.listen(8080);
}
bootstrap();
