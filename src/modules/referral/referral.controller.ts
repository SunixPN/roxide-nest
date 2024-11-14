import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { ReferralService } from './referral.service'
import { AuthGuard } from 'src/guards/auth.guard'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { My } from 'src/ApiTypes/Referals/My'

@Controller('/referral')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {
  }

  @ApiOperation({ summary: "Получение списка рефералов пользователя" })
  @ApiResponse({ status: 200, type: My })
  @Get('/my')
  @UseGuards(AuthGuard)
  async referrals(@Req() { user }) {
    return await this.referralService.referrals(user)
  }

}