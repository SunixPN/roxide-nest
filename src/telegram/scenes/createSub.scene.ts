import { Injectable } from "@nestjs/common";
import { Action, Ctx, Hears, Message, On, Wizard, WizardStep } from "nestjs-telegraf";
import { TaskService } from "src/modules/task/task.service";
import { Markup } from "telegraf";
import { IChatWithLink, IWizardContext } from "./create.scene";
import { EnumButtons } from "src/enums/buttons.enum";

@Injectable()
@Wizard("create-sub")
export class CreateSubScene {

    constructor(private readonly taskService: TaskService) {}

    @Hears(EnumButtons.BACK)
    async back(@Ctx() ctx: IWizardContext) {
        await ctx.reply("Select an action: ")
        ctx.scene.leave() 
    }

    @WizardStep(1)
    async step1(@Ctx() ctx: IWizardContext) {
        await ctx.reply("Enter the name of the main task: ")
        ctx.wizard.next()
    }

    @WizardStep(2)
    async step2(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        try {
            const task = await this.taskService.findTaskByName(message)

            ctx.wizard.state.main_task_id = task.id
            await ctx.reply("Enter the name of the task: ")
            ctx.wizard.next()
        }

        catch {
            await ctx.reply("This task was not found, please try again: ")
            return
        }

    }

    @WizardStep(3)
    async step3(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        const task = await this.taskService.findTaskByName(message, true)

        if (task) {
            await ctx.reply("A task with this name already exists, try again: ")
            return
        }

        else {
            ctx.wizard.state.title = message
            await ctx.reply("Enter a description of the task\nOr type /empty to skip this step: ")
            ctx.wizard.next()
        }

    }

    @WizardStep(4)
    async step4(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        if (message === "/empty") {
            await ctx.reply("Select the type of link: ", Markup.inlineKeyboard(
                [
                    Markup.button.callback("Link to external resources", "OUTER"),
                    Markup.button.callback("Link to telegram channel", "INNER"),
                ]
            ))
            ctx.wizard.next()
        }

        else {
            ctx.wizard.state.description = message
            await ctx.reply("Select the type of link: ", Markup.inlineKeyboard(
                [
                    Markup.button.callback("Link to external resources", "OUTER"),
                    Markup.button.callback("Link to telegram channel", "INNER"),
                ]
            ))
            ctx.wizard.next()
        }
    }

    @WizardStep(5)
    @On("text")
    async step5_text(@Ctx() ctx: IWizardContext) {
        await ctx.reply("Select the type of link: ", Markup.inlineKeyboard(
            [
                Markup.button.callback("Link to external resources", "OUTER"),
                Markup.button.callback("Link to telegram channel", "INNER"),
            ]
        ))

        return
    }

    @WizardStep(5)
    @Action("OUTER")
    async step5_out(@Ctx() ctx: IWizardContext) {
        ctx.reply("Enter link: ")
        ctx.wizard.state.link_type = "OUTER"
        ctx.wizard.next()
    }

    @WizardStep(6)
    @Action("INNER")
    async step5_inner(@Ctx() ctx: IWizardContext) {
        ctx.reply("Enter a telegram channel ID (Make sure the bot is the administrator of this channel): ")
        ctx.wizard.state.link_type = "INNER"
        ctx.wizard.next()
    }

    @WizardStep(6)
    async step6(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        if (ctx.wizard.state.link_type === "INNER") {
            try {
                const chatMember = await ctx.telegram.getChatMember(message, ctx.botInfo.id)
                const chat = await ctx.telegram.getChat(message)

                if (chatMember.status !== "administrator") {
                    await ctx.reply("Check if the bot is the admin of this channel and try again: ")
                    return
                }

                else {
                    ctx.wizard.state.channel_id = message
                    const chatWithLink = chat as IChatWithLink

                    ctx.wizard.state.channel_link = chatWithLink?.invite_link ?? null  
                }

                
            }

            catch {
                await ctx.reply("Check if the bot is the admin of this channel and try again: ")
                return
            }
        }

        else {
            const urlPattern = new RegExp(
                '^(https?:\\/\\/)?' +
                '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|' +
                '((\\d{1,3}\\.){3}\\d{1,3}))' +
                '(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*' +
                '(\\?[;&a-zA-Z\\d%_.~+=-]*)?' +
                '(\\#[-a-zA-Z\\d_]*)?$', 'i'
            )

            if (!urlPattern.test(message)) {
                await ctx.reply("Incorrect URL format! Try again: ")
                return
            }

            ctx.wizard.state.link = message
        }

        const state = ctx.wizard.state

        await this.taskService.createSubTask({
            title: state.title,
            description: state.description,
            coins: state.coins,
            link: state.link,
            channel_id: state.channel_id,
            main_task_id: state.main_task_id,
            channel_link: state.channel_link
        }, state.main_task_id)

        await ctx.reply("Subtask successfully created !")
        ctx.scene.leave()
    }


}