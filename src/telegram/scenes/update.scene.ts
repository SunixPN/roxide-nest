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
        await ctx.reply("Выберите действие: ")
        ctx.scene.leave() 
    }

    @WizardStep(1)
    async step1(@Ctx() ctx: IWizardContext) {
        await ctx.reply("Введите название задачи которую хотите редактировать: ")
        ctx.wizard.next()
    }

    @WizardStep(2)
    async step2(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        try {
            const task = await this.taskService.findTaskByName(message)

            ctx.wizard.state.main_task_id = task.id
            await ctx.reply("Введите новое название задачи\nЛибо введите команду /empty чтобы пропустить этот шаг: ")
            ctx.wizard.next()
        }

        catch {
            await ctx.reply("Данной задачи не было найдено, повторите попытку: ")
            return
        }
    }

    @WizardStep(3)
    async step3(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        if (message === "/empty") {
            await ctx.reply("Введите новое описание задачи\nЛибо введите команду /empty чтобы пропустить этот шаг: ")
            ctx.wizard.next()
        }

        else {
            const task = await this.taskService.findTaskByName(message, true)

            if (task) {
                await ctx.reply("Задача с данным названием уже существует, повторите попытку: ")
                return
            }
            ctx.wizard.state.title = message
            await ctx.reply("Введите новое описание задачи\nЛибо введите команду /empty чтобы пропустить этот шаг: ")
            ctx.wizard.next()
        }
    }

    @WizardStep(4)
    async step4(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        if (message === "/empty") {
            await ctx.reply("Введите награду за данную задачу\nЛибо введите команду /empty чтобы пропустить этот шаг: ")
            ctx.wizard.next()
        }

        else {
            ctx.wizard.state.description = message
            await ctx.reply("Введите награду за данную задачу\nЛибо введите команду /empty чтобы пропустить этот шаг: ")
    
            ctx.wizard.next()
        }
    }

    @WizardStep(5)
    async step5(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        if (message === "/empty") {
            await ctx.reply("Выберите тип ссылки\nЛибо введите команду /empty чтобы пропустить этот шаг: ", Markup.inlineKeyboard(
                [
                    Markup.button.callback("Ссылка на внешние ресурсы", "OUTER"),
                    Markup.button.callback("Ссылка на телеграм канал", "INNER"),
                ]
            ))
            ctx.wizard.next()
        }
        else if (isNaN(+message)) {
            await ctx.reply("Неверный формат данных! Повторите попытку\nЛибо введите команду /empty чтобы пропустить этот шаг:")
            return
        }

        else {
            ctx.wizard.state.coins = +message
            await ctx.reply("Выберите тип ссылки\nЛибо введите команду /empty чтобы пропустить этот шаг: ", Markup.inlineKeyboard(
                [
                    Markup.button.callback("Ссылка на внешние ресурсы", "OUTER"),
                    Markup.button.callback("Ссылка на телеграм канал", "INNER"),
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
    
            await ctx.reply("Задача успешно обновлена")
            ctx.scene.leave()
        }

        else {
            await ctx.reply("Если хотите пропустить данный шаг, введите команду /empty")
            return
        }
        
    }

    @WizardStep(6)
    @Action("OUTER")
    async step6_out(@Ctx() ctx: IWizardContext) {
        ctx.reply("Введите новую ссылку: ")
        ctx.wizard.state.link_type = "OUTER"
        ctx.wizard.next()
    }

    @WizardStep(6)
    @Action("INNER")
    async step6_inner(@Ctx() ctx: IWizardContext) {
        ctx.reply("Введите новый ID телеграмм канала (Убедитесь, что бот является администратором этого канала): ")
        ctx.wizard.state.link_type = "INNER"
        ctx.wizard.next()
    }

    @WizardStep(7)
    async step7(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        if (ctx.wizard.state.link_type === "INNER") {
            try {
                const chatMember = await ctx.telegram.getChatMember(message, ctx.botInfo.id)

                if (chatMember.status !== "administrator") {
                    await ctx.reply("Проверьте является ли бот админом данного канала и повторите попытку: ")
                    return
                }

                else {
                    ctx.wizard.state.channel_id = message
                }

                
            }

            catch {
                await ctx.reply("Проверьте является ли бот админом данного канала и повторите попытку: ")
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
                await ctx.reply("Не верный формат URL! Повторите попытку: ")
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

        await ctx.reply("Задача успешно обновлена")
        ctx.scene.leave()
    }


}