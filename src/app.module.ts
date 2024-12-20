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
import { RevenuesModule } from './modules/revenues/revenues.module';
import { ServeStaticModule } from '@nestjs/serve-static'
import { ProxyModule } from './modules/proxy/proxy.module';
import * as path from 'path'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, "..", ""),
    }),
    SequelizeModule.forRootAsync(options()),
    FarmModule,
    ReferralModule,
    TelegramModule,
    BonusModule,
    UserModule,
    TaskModule,
    RevenuesModule,
    ProxyModule
  ],
  controllers: []
})
export class AppModule {}
