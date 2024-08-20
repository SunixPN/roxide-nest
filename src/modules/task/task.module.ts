import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/entities/user.model';
import { Task } from 'src/entities/task.model';
import { UserTask } from 'src/entities/userTask.model';

@Module({
  controllers: [TaskController],
  providers: [TaskService],
  imports: [
    SequelizeModule.forFeature([User, Task, UserTask])
  ]
})
export class TaskModule {}
