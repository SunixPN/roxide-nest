import { Module } from '@nestjs/common';
import { RevenuesService } from './revenues.service';
import { RevenuesController } from './revenues.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Revenues } from 'src/entities/revenues.model';
import { User } from 'src/entities/user.model';

@Module({
  controllers: [RevenuesController],
  providers: [RevenuesService],
  imports: [
    SequelizeModule.forFeature([Revenues, User]),
  ]
})
export class RevenuesModule {}
