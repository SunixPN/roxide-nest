import { Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { ProxyController } from './proxy.controller';
import { TelegramModule } from 'src/telegram/telegram.module';

@Module({
  controllers: [ProxyController],
  providers: [ProxyService],
  imports: [TelegramModule]
})
export class ProxyModule {}
