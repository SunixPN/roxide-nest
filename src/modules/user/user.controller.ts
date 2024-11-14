import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/entities/user.model';
import { ChangeLanguageDto } from './dto/language.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Raiting } from 'src/ApiTypes/Users/Raiting';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: "Получение топ 100 пользователей с личным местом в списке" })
  @ApiResponse({ status: 200, type: Raiting })
  @Get("/raiting")
  @UseGuards(AuthGuard)
  raiting(@Req() { user }) {
    return this.userService.usersRaiting(user as User)
  }

  @ApiOperation({ summary: "Изменение языка пользователя" })
  @ApiResponse({ status: 200, type: Raiting })
  @Post("/language")
  @UseGuards(AuthGuard)
  language(@Req() { user }, @Body() languageDto: ChangeLanguageDto) {
    return this.userService.changeLanguage(user as User, languageDto.lng)
  }
}
