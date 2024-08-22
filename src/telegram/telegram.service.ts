import { BadRequestException, Inject, forwardRef } from '@nestjs/common';
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
        @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
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

    async getUserInfo(telegram_id: bigint) {
        const userInfo = await this.telegram.getChat(telegram_id.toString())
        const photo = await this.telegram.getUserProfilePhotos(Number(telegram_id))
        let fileUrl: string

        if (photo.total_count > 0) {
            const lastPhotoSet = photo.photos[0]

            const lastPhoto = lastPhotoSet[lastPhotoSet.length - 1]

            const file = await this.telegram.getFile(lastPhoto.file_id)
            const token = this.configService.get<string>("TELEGRAM_BOT_TOKEN")

            fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`
        }

        return  {
            ...userInfo,
            photo: fileUrl
        }
    }

    async checkSubscribe(telegram_id: bigint, channel_id: string) {
        try {
            const isSub = await this.telegram.getChatMember(channel_id, Number(telegram_id))

            if (["left", "kicked"].includes(isSub.status)) {
                throw new BadRequestException("User was left from this channel")
            }

            return {
                in_channel: true
            }
        }

        catch (e) {
            throw new BadRequestException(e.message)
        }

    }
}
