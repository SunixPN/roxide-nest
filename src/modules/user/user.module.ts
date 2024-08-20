import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/entities/user.model';
import { Farm } from 'src/entities/farm.model';
import { Bonus } from 'src/entities/bonus.model';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    SequelizeModule.forFeature([User, Farm, Bonus])
  ]
})
export class UserModule {}
