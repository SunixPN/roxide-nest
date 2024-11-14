import { Controller, Get, Req, Post, UseGuards } from '@nestjs/common'
import { FarmService } from './farm.service'
import { AuthGuard } from 'src/guards/auth.guard'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { StatusResponse } from 'src/ApiTypes/Farm/StatusResponse'
import { FarmStart } from 'src/ApiTypes/Farm/FarmStart'

@Controller('farm')
export class FarmController {
  constructor(private readonly farmService: FarmService) {
  }

  @ApiOperation({ summary: "Получение статуса фарма" })
  @ApiResponse({ status: 200, type: StatusResponse })
  @Get('/status')
  @UseGuards(AuthGuard)
  async status(@Req() { user }) {
    return await this.farmService.status(user)
  }

  @ApiOperation({ summary: "Заклеймить бонус (только если статус фарма CLAIM)" })
  @ApiResponse({ status: 200, type: FarmStart })
  @Post('/claim')
  @UseGuards(AuthGuard)
  async claim(@Req() { user }) {
    return await this.farmService.claim(user)
  }

  @ApiOperation({ summary: "Начать фарм" })
  @ApiResponse({ status: 200, type: FarmStart })
  @Post('/start')
  @UseGuards(AuthGuard)
  async start(@Req() { user }) {
    return await this.farmService.start(user.id)
  }
}
