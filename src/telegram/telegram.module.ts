import {Module} from '@nestjs/common';
import {TelegrafModule} from 'nestjs-telegraf';
import {options} from '../../config/telegram.config';
import {TelegramService} from './telegram.service';
import {SequelizeModule} from '@nestjs/sequelize';
import {User} from '../entities/user.model';
import { Farm } from 'src/entities/farm.model';
import { Bonus } from 'src/entities/bonus.model';

@Module({
    imports: [
        TelegrafModule.forRootAsync(options()),
        SequelizeModule.forFeature([User, Farm, Bonus])
    ],
    providers: [TelegramService],
})
export class TelegramModule {}