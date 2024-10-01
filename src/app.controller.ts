import { Controller, Get, Req } from '@nestjs/common';

// Services
import { AppService } from './app.service';


@Controller()
	export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get('/hello')
	getHello(): string {
		// console.log('CurrentUser: ', currentUser);
		return this.appService.getHello();
	}
}
