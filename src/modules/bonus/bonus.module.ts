import { Module } from '@nestjs/common';
import { BonusService } from './bonus.service';
import { BonusController } from './bonus.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Bonus } from 'src/entities/bonus.model';
import { User } from 'src/entities/user.model';

@Module({
  controllers: [BonusController],
  providers: [BonusService],
  imports: [
    SequelizeModule.forFeature([Bonus, User])
  ]
})
export class BonusModule {}
