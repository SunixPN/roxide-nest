import {Module} from '@nestjs/common';
import {TelegrafModule} from 'nestjs-telegraf';
import {options} from '../../config/telegram.config';
import {TelegramService} from './telegram.service';
import {SequelizeModule} from '@nestjs/sequelize';
import {User} from '../entities/user.model';
import { Farm } from 'src/entities/farm.model';

@Module({
    imports: [
        TelegrafModule.forRoot(options),
        SequelizeModule.forFeature([User, Farm])
    ],
    providers: [TelegramService],
})
export class TelegramModule {}