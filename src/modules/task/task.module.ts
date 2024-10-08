import { Module, forwardRef } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/entities/user.model';
import { Task } from 'src/entities/task.model';
import { UserTask } from 'src/entities/userTask.model';
import { TelegramService } from 'src/telegram/telegram.service';
import { Farm } from 'src/entities/farm.model';
import { Bonus } from 'src/entities/bonus.model';
import { UserService } from '../user/user.service';
import { TelegramModule } from 'src/telegram/telegram.module';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [TaskController],
  providers: [TaskService],
  imports: [
    SequelizeModule.forFeature([User, Task, UserTask, Farm, Bonus]),
    forwardRef(() => TelegramModule),
    UserModule
  ],

  exports: [TaskService]
})
export class TaskModule {}
