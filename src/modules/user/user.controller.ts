import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/entities/user.model';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/raiting")
  @UseGuards(AuthGuard)
  raiting(@Req() { user }) {
    return this.userService.usersRaiting(user as User)
  }
}
