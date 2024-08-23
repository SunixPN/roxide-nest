import { BadRequestException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import {Start, Update, Ctx, Command, Hears, On} from 'nestjs-telegraf';
import { Revenues } from 'src/entities/revenues.model';
import { ICreateUser, User } from 'src/entities/user.model';
import { UserService } from 'src/modules/user/user.service';
import { Scenes, Telegraf } from 'telegraf';
import { actionButtons } from './bot.buttons';
import { EnumButtons } from 'src/enums/buttons.enum';
import { TelegramGuard } from 'src/guards/telegram.guard';

type Context = Scenes.SceneContext

@Update()
export class TelegramService extends Telegraf<Context> {

    constructor(
        @InjectModel(User) private readonly userRepository: typeof User,
        @InjectModel(Revenues) private readonly revenuesRepository: typeof Revenues,
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        ) { 
            super(configService.get<string>("TELEGRAM_BOT_TOKEN")) 
        }

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

                    include: ["Referrals", "Revenues"]
                })

                if (!ref_user || ref_user.Referrals.length >= 15) {
                    ctx.replyWithHTML(
                        `
                        Ищите другого реферального партнёра!
                        `
                    )
                    return
                }

                if (!ref_user.Revenues) {
                    const currentDate = new Date()
                    currentDate.setDate(currentDate.getDate() + 1)

                    const revenues = await this.revenuesRepository.create({
                        next_revenues_time: currentDate,
                        userId: ref_user.id
                    })

                    await ref_user.$set("Revenues", revenues)
                    
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

    @Command("admin")
    @UseGuards(TelegramGuard)
    async admin(@Ctx() ctx: Context) {
        await ctx.reply("Выберите действие", actionButtons())
    }

    @Hears(EnumButtons.CREATE_TASK)
    @UseGuards(TelegramGuard)
    async create_task(@Ctx() ctx: Context) {
        ctx.scene.enter("create-task") 
    } 

    @Hears(EnumButtons.CREATE_SUB_TASK)
    @UseGuards(TelegramGuard)
    async createSubTask(@Ctx() ctx: Context) {
        ctx.scene.enter("create-sub") 
    }

    @Hears(EnumButtons.DELETE_TASK)
    @UseGuards(TelegramGuard)
    async deleteTask(@Ctx() ctx: Context) {
        ctx.scene.enter("delete-task") 
    }

    @Hears(EnumButtons.UPDATE_TASK)
    @UseGuards(TelegramGuard)
    async updateTask(@Ctx() ctx: Context) {
        ctx.scene.enter("update-task") 
    }

    @On("text")
    async hello(@Ctx() ctx: Context) {
        ctx.reply("Привет! Для начала работы с ботом введите команду /start")
    }

    async getUserInfo(telegram_id: bigint) {
        try {
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

        catch (e) {
            console.log(e.message)
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
