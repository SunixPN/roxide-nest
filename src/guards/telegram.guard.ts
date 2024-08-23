import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Scenes } from "telegraf";

type Context = Scenes.SceneContext

@Injectable()
export class TelegramGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const ctx = context.switchToHttp().getRequest<Context>();
        const admins = [1213507635]

        const user = ctx.from

        if (!user) {
            return false
        }
    }
}