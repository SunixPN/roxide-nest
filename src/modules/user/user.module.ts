import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/entities/user.model';
import { Farm } from 'src/entities/farm.model';
import { Bonus } from 'src/entities/bonus.model';
import { UserTask } from 'src/entities/userTask.model';
import { Task } from 'src/entities/task.model';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    SequelizeModule.forFeature([User, Farm, Bonus, UserTask, Task])
  ]
})
export class UserModule {}
