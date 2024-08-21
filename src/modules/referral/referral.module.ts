import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from '../../entities/user.model'
import { ReferralService } from './referral.service'
import { ReferralController } from './referral.controller'
import { TelegramService } from 'src/telegram/telegram.service'
import { TelegramModule } from 'src/telegram/telegram.module'
import { UserService } from '../user/user.service'
import { UserModule } from '../user/user.module'
import { FarmModule } from '../farm/farm.module'
import { Farm } from 'src/entities/farm.model'
import { Bonus } from 'src/entities/bonus.model'
import { Task } from 'src/entities/task.model'
import { UserTask } from 'src/entities/userTask.model'

@Module({
  controllers: [ReferralController],
  providers: [ReferralService, TelegramService, UserService],
  imports: [
    SequelizeModule.forFeature([User, Farm, Bonus, Task, UserTask]),
  ]
})
export class ReferralModule {}