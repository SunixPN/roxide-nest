import { Controller, Get, Req } from '@nestjs/common'
import { ReferralService } from './referral.service'

@Controller('/referral')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {
  }

  @Get('/top')
  async top() {
    return await this.referralService.index()
  }

  @Get('/my')
  async referrals(@Req() { user }) {
    return await this.referralService.referrals(user.id)
  }

}