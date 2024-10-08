import { SequelizeModuleOptions, SequelizeModuleAsyncOptions } from '@nestjs/sequelize'
import { ConfigService } from '@nestjs/config'
import { User } from '../src/entities/user.model'
import { Farm } from '../src/entities/farm.model'
import { Bonus } from './../src/entities/bonus.model';
import { Task } from 'src/entities/task.model';
import { UserTask } from 'src/entities/userTask.model';
import { Revenues } from 'src/entities/revenues.model';

export const options = (): SequelizeModuleAsyncOptions => {
  return {
    imports: [],
    inject: [ConfigService],
    useFactory: (config: ConfigService): SequelizeModuleOptions => {
      return {
        dialect: 'postgres',
        // uri: config.get<string>("DATABASE_URL"),
        host: config.get<string>('DB_HOST'),
        port: +config.get<string>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        models: [User, Farm, Bonus, Task, UserTask, Revenues],
        // autoLoadModels: true,
        // sync: { alter: true },
      }
    }
  }
}
