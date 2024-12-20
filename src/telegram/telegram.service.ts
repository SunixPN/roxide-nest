import { BadRequestException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { Start, Update, Ctx, Command, Hears, On } from 'nestjs-telegraf';
import { Revenues } from 'src/entities/revenues.model';
import { ICreateUser, User } from 'src/entities/user.model';
import { UserService } from 'src/modules/user/user.service';
import { Markup, Scenes, Telegraf } from 'telegraf';
import { actionButtons } from './bot.buttons';
import { EnumButtons } from 'src/enums/buttons.enum';
import { TelegramGuard } from 'src/guards/telegram.guard';
import { LinksEnum } from 'src/enums/links.enum';
import { join } from 'path';
import { TaskService } from 'src/modules/task/task.service';
import { randomColor } from 'src/helpers/randomColor';

type Context = Scenes.SceneContext

@Update()
export class TelegramService extends Telegraf<Context> {

    constructor(
        @InjectModel(User) private readonly userRepository: typeof User,
        @InjectModel(Revenues) private readonly revenuesRepository: typeof Revenues,
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly taskService: TaskService
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
                telegramId: BigInt(ctx.from.id),
                color: randomColor(),
                username: ctx.from.username
            }

            const referal_id = ctx.text.split(" ")[1]

            if (referal_id) {
                const ref_user = await this.userRepository.findOne({
                    where: {
                        telegramId: referal_id
                    },

                    include: ["Referrals", "Revenues"]
                })

                if (!ref_user) {
                    ctx.reply(`Hi, @${ctx.from.username}! This invite link doesn't work, find another one and try again`, Markup.inlineKeyboard(
                        [
                            Markup.button.url("Join the community!", LinksEnum.CHANNEL_URL),
                        ]
                    ))

                    await this.userService.createUser(new_user)
                    
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
                const second_level_ref_user = await this.userRepository.findOne({
                    where: {
                        id: ref_user.referrerId
                    }
                })

                if (second_level_ref_user) {
                    second_level_ref_user.referals_count += 1
                    await second_level_ref_user.save()
                }
            }

            await this.userService.createUser(new_user)
        }

        await ctx.replyWithPhoto(
            { source: join(__dirname, "../../", "public/image.jpg") },
            {
                caption: "🚀<b>Welcome to BuxHub!</b>\n\nOur community can build a future based on productive collaboration and real results.\n\n<b>Soon you will be able to:</b>\ncreate, communicate, earn money - all in one application. A new era of evolution of social tasks is approaching.\n\n🛸<b>As for now… Earn BUX Points!</b>",
                parse_mode: "HTML",
                ...Markup.inlineKeyboard(
                    [
                        Markup.button.webApp("Launch BuxHub", LinksEnum.TELEGRAM_MINI_APP_URL),
                        Markup.button.url("Join Community!", LinksEnum.CHANNEL_URL),
                    ],
                    {
                        columns: 1
                    }
                )
            }
        )
    }

    @Command("admin")
    @UseGuards(TelegramGuard)
    async admin(@Ctx() ctx: Context) {
        await ctx.reply("Select an action", actionButtons())
    }

    @Hears(EnumButtons.CREATE_TASK)
    @UseGuards(TelegramGuard)
    async create_task(@Ctx() ctx: Context) {
        ctx.scene.enter("create-task")
    }

    @Hears(EnumButtons.MESSAGE_DISTRIBUTION)
    @UseGuards(TelegramGuard)
    async message(@Ctx() ctx: Context) {
        ctx.scene.enter("message")
    }

    @Hears(EnumButtons.VIEW_ARCHIVE)
    @UseGuards(TelegramGuard)
    async view(@Ctx() ctx: Context) {
        const tasksFromArchive = await this.taskService.getAllTaskFromArchive()
        if (tasksFromArchive.length === 0) {
            await ctx.reply("There are no tasks in archive")
            return
        }
        let valueString: string = "List of tasks✉️\n----------------------------------------------------\n"
        for (let i = 0; i < tasksFromArchive.length; i++) {
            valueString += `${i + 1}. Title: ${tasksFromArchive[i].dataValues.title}`

            const subTasks = tasksFromArchive[i].dataValues.sub_tasks

            if (subTasks.length !== 0) {
                valueString += `\n----------------------sub tasks✉️-----------------------------\n`
                for (let j = 0; j < subTasks.length; j++) {
                    valueString += `\t\t\t\t${i + 1}-${j + 1}. Title: ${subTasks[j].dataValues.title}`
                    if (j + 1 !== subTasks.length) {
                        valueString += "\n"
                    }
                }
                valueString += `\n------------------------------------------------------------`
            }

            valueString += "\n"
        }

        await ctx.reply(valueString)
    }

    @Hears(EnumButtons.CREATE_MAIN_TASK)
    @UseGuards(TelegramGuard)
    async create_main_task(@Ctx() ctx: Context) {
        ctx.scene.enter("create-main-task")
    }

    @Hears(EnumButtons.DELETE_FROM_ARCHIVE)
    @UseGuards(TelegramGuard)
    async delete_from_archive(@Ctx() ctx: Context) {
        ctx.scene.enter("delete-from-archive")
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
        ctx.reply("Hi! To start working with the bot, enter the /start command")
    }

    async getFile(file_id: string) {
        try {
            const file = await this.telegram.getFileLink(file_id) 
            return file.href
        }

        catch (err) {
            console.log(err)
        } 
    }

    async getPhoto(telegram_id: string) {
        try {
            const photo = await this.telegram.getUserProfilePhotos(Number(telegram_id))
            let fileUrl: string

            if (photo.total_count > 0) {
                const lastPhotoSet = photo.photos[0]

                const lastPhoto = lastPhotoSet[lastPhotoSet.length - 1]

                const file = await this.telegram.getFile(lastPhoto.file_id)
                const token = this.configService.get<string>("TELEGRAM_BOT_TOKEN")

                fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`
            }

            return fileUrl
        }

        catch (e) {
            console.log(e.message)
        }
    }

    async getUserInfo(telegram_id: bigint) {
        try {
            const userInfo = await this.telegram.getChat(telegram_id.toString())
            const file = await this.getPhoto(telegram_id.toString())
            let fileUrl: string | undefined = undefined

            if (file) {
                fileUrl = `https://api.bux-hub.pro/proxy/avatar/${telegram_id.toString()}`
            }
            

            return {
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
