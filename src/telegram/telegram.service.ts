import { InjectModel } from '@nestjs/sequelize';
import { options } from 'config/telegram.config';
import {Start, Update, Ctx} from 'nestjs-telegraf';
import { Farm } from 'src/entities/farm.model';
import { ICreateUser, User } from 'src/entities/user.model';
import {Scenes, Telegraf} from 'telegraf';

type Context = Scenes.SceneContext

@Update()
export class TelegramService extends Telegraf<Context> {

    constructor(
        @InjectModel(User) private readonly userRepository: typeof User,
        @InjectModel(Farm) private readonly farmRepository: typeof Farm
        ) { super(options.token) }

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
            
            const user = await this.userRepository.create({
                ...new_user
            })

            const farm = await this.farmRepository.create({
                startTime: null,
                userId: user.id
            })

            await user.$set("Farm", farm)
        }

        ctx.replyWithHTML(
            `
            <b>Привет, ${ctx.from.username}</b>\n Начнём игру ?
            `
        )
    }
}
