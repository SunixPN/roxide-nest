import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { RevenuesService } from './revenues.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/entities/user.model';

@Controller('revenues')
export class RevenuesController {
  constructor(private readonly revenuesService: RevenuesService) {}

  @Post("/claim")
  @UseGuards(AuthGuard)
  claimRevenues(@Req() { user }) {
    return this.revenuesService.claimRevenues(user as User)
  }
}
