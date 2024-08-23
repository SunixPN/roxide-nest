import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "src/entities/user.model";
import { EnumRoles } from "src/enums/roles.enum";
import { Scenes } from "telegraf";

type Context = Scenes.SceneContext

@Injectable()
export class TelegramGuard implements CanActivate {
    constructor(@InjectModel(User) private readonly userRepository: typeof User) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = context.switchToHttp().getRequest<Context>();
        const userTg = ctx.from

        const user = await this.userRepository.findOne({
            where: {
                telegramId: userTg.id
            }
        })


        if (!user || user.role !== EnumRoles.ADMIN) {
            return false
        }

        return true
    }
}