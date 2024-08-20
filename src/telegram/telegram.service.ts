import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import {Start, Update, Ctx} from 'nestjs-telegraf';
import { ICreateUser, User } from 'src/entities/user.model';
import { UserService } from 'src/modules/user/user.service';
import {Scenes, Telegraf} from 'telegraf';

type Context = Scenes.SceneContext

@Update()
export class TelegramService extends Telegraf<Context> {

    constructor(
        @InjectModel(User) private readonly userRepository: typeof User,
        private readonly userService: UserService,
        private readonly configService: ConfigService
        ) { super(configService.get<string>("TELEGRAM_BOT_TOKEN")) }

    @Start()
    async index(@Ctx() ctx: Context) {
        const candidate = await this.userRepository.findOne({
            where: {
                telegramId: ctx.from.id
            }
        })

        if (!candidate) {
            const new_user: ICreateUser = { 
                telegramId: BigInt(ctx.from.id) 
            }

            const referal_id = ctx.text.split(" ")[1]

            if (referal_id) {
                const ref_user = await this.userRepository.findOne({
                    where: {
                        telegramId: referal_id
                    },

                    include: ["Referrals"]
                })

                if (!ref_user || ref_user.Referrals.length >= 15) {
                    ctx.replyWithHTML(
                        `
                        Ищите другого реферального партнёра!
                        `
                    )
                    return
                }

                new_user.referrerId = ref_user.id
            }

            await this.userService.createUser(new_user)
        }

        ctx.replyWithHTML(
            `
            <b>Привет, ${ctx.from.username}</b>\nНачнём игру ?
            `
        )
    }
}
