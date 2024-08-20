import {
  Module,
} from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { options } from '../config/database.config'
import { ConfigModule } from '@nestjs/config'
import { FarmModule } from './modules/farm/farm.module'
import { ReferralModule } from './modules/referral/referral.module'
import { TelegramModule } from './telegram/telegram.module'
import { BonusModule } from './modules/bonus/bonus.module';
import { UserModule } from './modules/user/user.module';
import { TaskModule } from './modules/task/task.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync(options()),
    FarmModule,
    ReferralModule,
    TelegramModule,
    BonusModule,
    UserModule,
    TaskModule
  ],
  controllers: []
})
export class AppModule {}
