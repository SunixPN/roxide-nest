import { Controller, Get, Req, Post, UseGuards } from '@nestjs/common'
import { FarmService } from './farm.service'
import { AuthGuard } from 'src/guards/auth.guard'

@Controller('farm')
export class FarmController {
  constructor(private readonly farmService: FarmService) {
  }

  @Get('/status')
  @UseGuards(AuthGuard)
  async status(@Req() { user }) {
    return await this.farmService.status(user)
  }

  @Post('/claim')
  @UseGuards(AuthGuard)
  async claim(@Req() { user }) {
    return await this.farmService.claim(user)
  }

  @Post('/start')
  @UseGuards(AuthGuard)
  async start(@Req() { user }) {
    return await this.farmService.start(user.id)
  }
}
