import { ConfigService } from '@nestjs/config';
import {TelegrafModuleAsyncOptions, TelegrafModuleOptions} from 'nestjs-telegraf';
import * as LocalSesions from "telegraf-session-local"

const sessions = new LocalSesions({ database: "session_db.json" })

export const options = (): TelegrafModuleAsyncOptions => {
  return {
    inject: [ConfigService],
    useFactory: (config: ConfigService): TelegrafModuleOptions => {
      return {
        botName: config.get<string>("TELEGRAM_BOT_NAME"),
        token: config.get<string>("TELEGRAM_BOT_TOKEN"),
        middlewares: [sessions.middleware()]
      }
    }
  }
}