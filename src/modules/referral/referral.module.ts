import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from '../../entities/user.model'
import { ReferralService } from './referral.service'
import { ReferralController } from './referral.controller'

@Module({
  controllers: [ReferralController],
  providers: [ReferralService],
  imports: [
    SequelizeModule.forFeature([User])
  ]
})
export class ReferralModule {}