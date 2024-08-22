import {Module, forwardRef} from '@nestjs/common';
import {TelegrafModule} from 'nestjs-telegraf';
import {options} from '../../config/telegram.config';
import {TelegramService} from './telegram.service';
import {SequelizeModule} from '@nestjs/sequelize';
import {User} from '../entities/user.model';
import { UserModule } from 'src/modules/user/user.module';

@Module({
    imports: [
        TelegrafModule.forRootAsync(options()),
        SequelizeModule.forFeature([User]),
        forwardRef(() => UserModule) 
    ],
    providers: [TelegramService],
    exports: [TelegramService]
})
export class TelegramModule {}