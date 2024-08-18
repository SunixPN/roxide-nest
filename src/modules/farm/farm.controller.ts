import { Controller, Get, Req, Post } from '@nestjs/common'
import { FarmService } from './farm.service'

@Controller('farm')
export class FarmController {
  constructor(private readonly farmService: FarmService) {
  }

  @Get('/status')
  async status(@Req() { user }) {
    return await this.farmService.status(user.id)
  }

  @Post('/claim')
  async claim(@Req() { user }) {
    return await this.farmService.claim(user)
  }

  @Post('/start')
  async start(@Req() { user }) {
    return await this.farmService.start(user.id)
  }
}
