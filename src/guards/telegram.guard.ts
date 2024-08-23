import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Scenes } from "telegraf";

type Context = Scenes.SceneContext

@Injectable()
export class TelegramGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = context.switchToHttp().getRequest<Context>();
        const admins = [1213507635]

        const user = ctx.from

        if (!user) {
            await ctx.reply("У вас нет доступа к этой команде!")
            return false
        }

        if (admins.includes(user.id)) {
            return true
        }
    }
}