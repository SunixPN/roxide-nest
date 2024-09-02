import { Injectable } from "@nestjs/common";
import { Action, Ctx, Hears, Message, On, Wizard, WizardStep } from "nestjs-telegraf";
import { TaskService } from "src/modules/task/task.service";
import { Markup } from "telegraf";
import { IWizardContext } from "./create.scene";
import { EnumButtons } from "src/enums/buttons.enum";

@Injectable()
@Wizard("update-task")
export class UpdateTaskScene {

    constructor(private readonly taskService: TaskService) {}

    @Hears(EnumButtons.BACK)
    async back(@Ctx() ctx: IWizardContext) {
        await ctx.reply("Select an action: ")
        ctx.scene.leave() 
    }

    @WizardStep(1)
    async step1(@Ctx() ctx: IWizardContext) {
        await ctx.reply("Enter the name of the task you want to edit: ")
        ctx.wizard.next()
    }

    @WizardStep(2)
    async step2(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        try {
            const task = await this.taskService.findTaskByName(message)

            ctx.wizard.state.main_task_id = task.id
            await ctx.reply("Enter a new task name\nOr enter the /empty command to skip this step: ")
            ctx.wizard.next()
        }

        catch {
            await ctx.reply("This task was not found, please try again: ")
            return
        }
    }

    @WizardStep(3)
    async step3(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        if (message === "/empty") {
            await ctx.reply("Enter a new task description\nOr enter the /empty command to skip this step: ")
            ctx.wizard.next()
        }

        else {
            const task = await this.taskService.findTaskByName(message, true)

            if (task) {
                await ctx.reply("A task with this name already exists, try again: ")
                return
            }
            ctx.wizard.state.title = message
            await ctx.reply("Enter a new task description\nOr enter the /empty command to skip this step: ")
            ctx.wizard.next()
        }
    }

    @WizardStep(4)
    async step4(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        if (message === "/empty") {
            await ctx.reply("Enter the reward for this task\nOr enter /empty to skip this step: ")
            ctx.wizard.next()
        }

        else {
            ctx.wizard.state.description = message
            await ctx.reply("Enter the reward for this task\nOr enter /empty to skip this step: ")
    
            ctx.wizard.next()
        }
    }

    @WizardStep(5)
    async step5(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        if (message === "/empty") {
            await ctx.reply("Select the link type\nOr type /empty to skip this step: ", Markup.inlineKeyboard(
                [
                    Markup.button.callback("Link to external resources", "OUTER"),
                    Markup.button.callback("Link to telegram channel", "INNER"),
                ]
            ))
            ctx.wizard.next()
        }
        else if (isNaN(+message)) {
            await ctx.reply("Incorrect data format! Try again or enter /empty to skip this step:")
            return
        }

        else {
            ctx.wizard.state.coins = +message
            await ctx.reply("Select the link type\nOr type /empty to skip this step: ", Markup.inlineKeyboard(
                [
                    Markup.button.callback("Link to external resources", "OUTER"),
                    Markup.button.callback("Link to telegram channel", "INNER"),
                ]
            ))
            ctx.wizard.next()
        }



    }

    @WizardStep(6)
    @On("text")
    async step6_empty(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        if (message === "/empty") {
            const state = ctx.wizard.state

            await this.taskService.updateTask({
                title: state.title,
                description: state.description,
                coins: state.coins,
                link: state.link,
                channel_id: state.channel_id,
                main_task_id: null
            }, state.main_task_id)
    
            await ctx.reply("The task has been successfully updated")
            ctx.scene.leave()
        }

        else {
            await ctx.reply("If you want to skip this step, enter the /empty command")
            return
        }
        
    }

    @WizardStep(6)
    @Action("OUTER")
    async step6_out(@Ctx() ctx: IWizardContext) {
        ctx.reply("Enter a new link: ")
        ctx.wizard.state.link_type = "OUTER"
        ctx.wizard.next()
    }

    @WizardStep(6)
    @Action("INNER")
    async step6_inner(@Ctx() ctx: IWizardContext) {
        ctx.reply("Enter a new telegram channel ID (Make sure the bot is the administrator of this channel): ")
        ctx.wizard.state.link_type = "INNER"
        ctx.wizard.next()
    }

    @WizardStep(7)
    async step7(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        if (ctx.wizard.state.link_type === "INNER") {
            try {
                const chatMember = await ctx.telegram.getChatMember(message, ctx.botInfo.id)

                if (chatMember.status !== "administrator") {
                    await ctx.reply("Check if the bot is the admin of this channel and try again: ")
                    return
                }

                else {
                    ctx.wizard.state.channel_id = message
                }

                
            }

            catch {
                await ctx.reply("Check if the bot is the admin of this channel and try again: ")
                return
            }
            
        }

        else if (ctx.wizard.state.link_type === "OUTER") {
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

        await this.taskService.updateTask({
            title: state.title,
            description: state.description,
            coins: state.coins,
            link: state.link,
            channel_id: state.channel_id,
            main_task_id: null
        }, state.main_task_id)

        await ctx.reply("The task has been successfully updated !")
        ctx.scene.leave()
    }


}