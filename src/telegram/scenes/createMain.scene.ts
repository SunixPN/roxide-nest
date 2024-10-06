import { Injectable } from "@nestjs/common";
import { Action, Ctx, Hears, Message, On, Wizard, WizardStep } from "nestjs-telegraf";
import { ITaskCreate } from "src/entities/task.model";
import { EnumButtons } from "src/enums/buttons.enum";
import { EnumIcons } from "src/enums/icons.enum";
import { TaskService } from "src/modules/task/task.service";
import { Markup, Scenes } from "telegraf";
import { ChatFromGetChat } from "telegraf/typings/core/types/typegram";
import { WizardContext } from "telegraf/typings/scenes";

interface MyWizard extends Scenes.WizardContextWizard<Scenes.WizardContext<Scenes.WizardSessionData>> {
    state: ITaskCreate & { link_type?: "OUTER" | "INNER" }
}

export interface IWizardContext extends WizardContext {
    wizard: MyWizard
}

export type IChatWithLink = {
    invite_link?: string,
    username: string
} & ChatFromGetChat

@Injectable()
@Wizard("create-main-task")
export class CreateMainTaskScene {

    constructor(private readonly taskService: TaskService) { }

    @Hears(EnumButtons.BACK)
    async back(@Ctx() ctx: IWizardContext) {
        await ctx.reply("Select an action: ")
        ctx.scene.leave()
    }

    @WizardStep(1)
    async step1(@Ctx() ctx: IWizardContext) {
        await ctx.reply("Enter the name of the task: ")
        ctx.wizard.next()
    }

    @WizardStep(2)
    async step2(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        const task = await this.taskService.findTaskByName(message, true)

        if (task) {
            await ctx.reply("A task with this name already exists, try again: ")
            return
        }

        ctx.wizard.state.title = message
        await ctx.reply("Enter a description of the task\nOr type /empty to skip this step: ")
        ctx.wizard.next()
    }

    @WizardStep(3)
    async step3(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        if (message === "/empty") {
            await ctx.reply("Enter the reward for this task: ")
            ctx.wizard.next()
        }

        else {
            ctx.wizard.state.description = message
            await ctx.reply("Enter the reward for this task: ")

            ctx.wizard.next()
        }
    }

    @WizardStep(4)
    async step4(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        if (isNaN(+message)) {
            await ctx.reply("Incorrect data format! Try again")
            return
        }

        else {
            ctx.wizard.state.coins = +message
            await ctx.reply("Select the icon type\nOr type /empty to skip this step: ", Markup.inlineKeyboard(
                [
                    Markup.button.callback("Youtube", "YT"),
                    Markup.button.callback("Telegram", "TG"),
                    Markup.button.callback("Twitter", "TW"),
                    Markup.button.callback("Facebook", "FB"),
                    Markup.button.callback("Instagram", "IN"),
                ],
                {
                    columns: 2
                }
            ))
            ctx.wizard.next()
        }
    }

    @WizardStep(5)
    @On("text")
    async step5_empty(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        if (message === "/empty") {
            await ctx.reply("Select the link type: ", Markup.inlineKeyboard(
                [
                    Markup.button.callback("Link to external resources", "OUTER"),
                    Markup.button.callback("Link to telegram channel", "INNER"),
                ]
            ))
            ctx.wizard.next()
        }

        else {
            await ctx.reply("Select the icon type\nOr type /empty to skip this step: ", Markup.inlineKeyboard(
                [
                    Markup.button.callback("Youtube", "YT"),
                    Markup.button.callback("Telegram", "TG"),
                    Markup.button.callback("Twitter", "TW"),
                    Markup.button.callback("Facebook", "FB"),
                    Markup.button.callback("Instagram", "IN"),
                ],
                {
                    columns: 2
                }
            ))
            return
        }
    }

    @WizardStep(5)
    @Action("YT")
    async step5_yt(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        ctx.wizard.state.icon = EnumIcons.YOUTUBE
        const state = ctx.wizard.state

        await this.taskService.createTask({
            title: state.title,
            description: state.description,
            coins: state.coins,
            link: state.link,
            channel_id: state.channel_id,
            main_task_id: null,
            channel_link: state.channel_link,
            icon: state.icon,
            is_archive: true
        })
        await ctx.reply("The main task has been successfully add to archive !")
        ctx.scene.leave()

    }

    @WizardStep(5)
    @Action("TG")
    async step5_tg(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        ctx.wizard.state.icon = EnumIcons.TELEGRAM
        const state = ctx.wizard.state

        await this.taskService.createTask({
            title: state.title,
            description: state.description,
            coins: state.coins,
            link: state.link,
            channel_id: state.channel_id,
            main_task_id: null,
            channel_link: state.channel_link,
            icon: state.icon,
            is_archive: true
        })
        await ctx.reply("The main task has been successfully add to archive !")
        ctx.scene.leave()
    }

    @WizardStep(5)
    @Action("TW")
    async step5_tw(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        ctx.wizard.state.icon = EnumIcons.TWITTER
        const state = ctx.wizard.state

        await this.taskService.createTask({
            title: state.title,
            description: state.description,
            coins: state.coins,
            link: state.link,
            channel_id: state.channel_id,
            main_task_id: null,
            channel_link: state.channel_link,
            icon: state.icon,
            is_archive: true
        })
        await ctx.reply("The main task has been successfully add to archive !")
        ctx.scene.leave()

    }

    @WizardStep(5)
    @Action("FB")
    async step5_fc(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        ctx.wizard.state.icon = EnumIcons.FACEBOOK
        const state = ctx.wizard.state

        await this.taskService.createTask({
            title: state.title,
            description: state.description,
            coins: state.coins,
            link: state.link,
            channel_id: state.channel_id,
            main_task_id: null,
            channel_link: state.channel_link,
            icon: state.icon,
            is_archive: true
        })
        await ctx.reply("The main task has been successfully add to archive !")
        ctx.scene.leave()

    }

    @WizardStep(5)
    @Action("IN")
    async step5_in(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        ctx.wizard.state.icon = EnumIcons.INSTAGRAM
        const state = ctx.wizard.state

        await this.taskService.createTask({
            title: state.title,
            description: state.description,
            coins: state.coins,
            link: state.link,
            channel_id: state.channel_id,
            main_task_id: null,
            channel_link: state.channel_link,
            icon: state.icon,
            is_archive: true
        })
        await ctx.reply("The main task has been successfully add to archive !")
        ctx.scene.leave()
    }
}