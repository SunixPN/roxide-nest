import { Module } from '@nestjs/common'
import { FarmController } from './farm.controller'
import { SequelizeModule } from '@nestjs/sequelize'
import { FarmService } from './farm.service'
import { Farm } from '../../entities/farm.model'
import { User } from 'src/entities/user.model'

@Module({
  controllers: [FarmController],
  providers: [FarmService],
  imports: [
    SequelizeModule.forFeature([Farm, User])
  ]
})
export class FarmModule {
}