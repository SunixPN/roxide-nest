import { Module } from '@nestjs/common'
import { ReferralService } from './referral.service'
import { ReferralController } from './referral.controller'
import { TelegramModule } from 'src/telegram/telegram.module'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from 'src/entities/user.model'
import { UserModule } from '../user/user.module'

@Module({
  controllers: [ReferralController],
  providers: [ReferralService],
  imports: [
    TelegramModule,
    SequelizeModule.forFeature([User]),
    UserModule
  ]
})
export class ReferralModule {}