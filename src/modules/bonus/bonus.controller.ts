import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { BonusService } from './bonus.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/entities/user.model';

@Controller('bonus')
export class BonusController {
  	constructor(private readonly bonusService: BonusService) {}

	@Get("/status")
	@UseGuards(AuthGuard)
	bonusStatus(@Req() { user }) {
		return this.bonusService.bonusStatus(user as User)
	}

	@Post("/claim")
	@UseGuards(AuthGuard)
	bonusClaim(@Req() { user }) {
		return this.bonusService.bonusClaim(user as User)
	}
}
