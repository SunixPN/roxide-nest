import { Module } from '@nestjs/common';
import { RevenuesService } from './revenues.service';
import { RevenuesController } from './revenues.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Revenues } from 'src/entities/revenues.model';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [RevenuesController],
  providers: [RevenuesService],
  imports: [
    SequelizeModule.forFeature([Revenues]),
    UserModule
  ]
})
export class RevenuesModule {}
