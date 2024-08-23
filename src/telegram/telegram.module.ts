import {Module, forwardRef} from '@nestjs/common';
import {TelegrafModule} from 'nestjs-telegraf';
import {options} from '../../config/telegram.config';
import {TelegramService} from './telegram.service';
import {SequelizeModule} from '@nestjs/sequelize';
import {User} from '../entities/user.model';
import { UserModule } from 'src/modules/user/user.module';
import { Revenues } from 'src/entities/revenues.model';
import { TaskModule } from 'src/modules/task/task.module';
import { CreateTaskScene } from './scenes/create.scene';
import { CreateSubScene } from './scenes/createSub.scene';
import { DeleteScene } from './scenes/delete.scene';
import { UpdateTaskScene } from './scenes/update.scene';

@Module({
    imports: [
        TelegrafModule.forRootAsync(options()),
        SequelizeModule.forFeature([User, Revenues]),
        forwardRef(() => UserModule),
        forwardRef(() => TaskModule)
    ],
    providers: [TelegramService, CreateTaskScene, CreateSubScene, DeleteScene, UpdateTaskScene],
    exports: [TelegramService]
})
export class TelegramModule {}