import { SequelizeModuleOptions, SequelizeModuleAsyncOptions } from '@nestjs/sequelize'
import { ConfigService } from '@nestjs/config'
import { User } from '../src/entities/user.model'
import { Farm } from '../src/entities/farm.model'
import { Bonus } from './../src/entities/bonus.model';

export const options = (): SequelizeModuleAsyncOptions => {
  return {
    imports: [],
inject: [ConfigService],
    useFactory: (config: ConfigService): SequelizeModuleOptions => {
      return {
        dialect: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: +config.get<string>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        models: [User, Farm, Bonus],
        autoLoadModels: true,
        sync: { force: true },
      }
    }
  }
}
