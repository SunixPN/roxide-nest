import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { ReferralService } from './referral.service'
import { AuthGuard } from 'src/guards/auth.guard'

@Controller('/referral')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {
  }

  @Get('/top')
  @UseGuards(AuthGuard)
  async top() {
    return await this.referralService.index()
  }

  @Get('/my')
  @UseGuards(AuthGuard)
  async referrals(@Req() { user }) {
    return await this.referralService.referrals(user.id)
  }

}