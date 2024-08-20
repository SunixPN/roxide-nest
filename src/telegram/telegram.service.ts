import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import {Start, Update, Ctx} from 'nestjs-telegraf';
import { Bonus } from 'src/entities/bonus.model';
import { Farm } from 'src/entities/farm.model';
import { ICreateUser, User } from 'src/entities/user.model';
import {Scenes, Telegraf} from 'telegraf';

type Context = Scenes.SceneContext

@Update()
export class TelegramService extends Telegraf<Context> {

    constructor(
        @InjectModel(User) private readonly userRepository: typeof User,
        @InjectModel(Farm) private readonly farmRepository: typeof Farm,
        @InjectModel(Bonus) private readonly bonusRepository: typeof Bonus,
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
            
            const user = await this.userRepository.create({
                ...new_user
            })

            const farm = await this.farmRepository.create({
                startTime: null,
                userId: user.id
            })

            const currentDate = new Date()
            currentDate.setDate(currentDate.getDate() + 1)

            const bonus = await this.bonusRepository.create({
                userId: user.id,
                next_bonus_time: currentDate
            })

            await user.$set("Farm", farm)
            await user.$set("Bonus", bonus)
        }

        ctx.replyWithHTML(
            `
            <b>Привет, ${ctx.from.username}</b>\n Начнём игру ?
            `
        )
    }
}
