import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/entities/user.model';
import { ChangeLanguageDto } from './dto/language.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/raiting")
  @UseGuards(AuthGuard)
  raiting(@Req() { user }) {
    return this.userService.usersRaiting(user as User)
  }

  @Post("/language")
  @UseGuards(AuthGuard)
  language(@Req() { user }, @Body() languageDto: ChangeLanguageDto) {
    return this.userService.changeLanguage(user as User, languageDto.lng)
  }
}
