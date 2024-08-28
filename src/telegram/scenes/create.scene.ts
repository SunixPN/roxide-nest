import { Injectable } from "@nestjs/common";
import { Action, Ctx, Hears, Message, On, Wizard, WizardStep } from "nestjs-telegraf";
import { ITaskCreate, Task } from "src/entities/task.model";
import { EnumButtons } from "src/enums/buttons.enum";
import { TaskService } from "src/modules/task/task.service";
import { Markup, Scenes } from "telegraf";
import { WizardContext } from "telegraf/typings/scenes";

interface MyWizard extends Scenes.WizardContextWizard<Scenes.WizardContext<Scenes.WizardSessionData>> {
    state: ITaskCreate & { link_type?: "OUTER" | "INNER" }
}

export interface IWizardContext extends WizardContext {
    wizard: MyWizard
}

@Injectable()
@Wizard("create-task")
export class CreateTaskScene {

    constructor(private readonly taskService: TaskService) {}

    @Hears(EnumButtons.BACK)
    async back(@Ctx() ctx: IWizardContext) {
        await ctx.reply("Выберите действие: ")
        ctx.scene.leave() 
    }

    @WizardStep(1)
    async step1(@Ctx() ctx: IWizardContext) {
        await ctx.reply("Введите название задачи: ")
        ctx.wizard.next()
    }

    @WizardStep(2)
    async step2(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        const task = await this.taskService.findTaskByName(message, true)

        if (task) {
            await ctx.reply("Задача с данным названием уже существует, повторите попытку: ")
            return
        }

        ctx.wizard.state.title = message
        await ctx.reply("Введите описание задачи\nЛибо введите команду /empty чтобы пропустить этот шаг: ")
        ctx.wizard.next()
    }

    @WizardStep(3)
    async step3(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        if (message === "/empty") {
            await ctx.reply("Введите награду за данную задачу: ")
            ctx.wizard.next()
        }

        else {
            ctx.wizard.state.description = message
            await ctx.reply("Введите награду за данную задачу: ")
    
            ctx.wizard.next()
        }
    }

    @WizardStep(4)
    async step4(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        if (isNaN(+message)) {
            await ctx.reply("Неверный формат данных! Повторите попытку")
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

    @WizardStep(5)
    @On("text")
    async step5_empty(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        if (message === "/empty") {
            const state = ctx.wizard.state

            await this.taskService.createTask({
                title: state.title,
                description: state.description,
                coins: state.coins,
                link: state.link,
                channel_id: state.channel_id,
                main_task_id: null
            })
            await ctx.reply("Задача успешно создана !")
            ctx.scene.leave()
        }

        else {
            await ctx.reply("Если хотите пропустить данный шаг, введите команду /empty, либо выберите тип ссылки: ", Markup.inlineKeyboard(
                [
                    Markup.button.callback("Ссылка на внешние ресурсы", "OUTER"),
                    Markup.button.callback("Ссылка на телеграм канал", "INNER"),
                ]
            ))
            return
        }
        
    }

    @WizardStep(5)
    @Action("OUTER")
    async step5_out(@Ctx() ctx: IWizardContext) {
        ctx.reply("Введите ссылку: ")
        ctx.wizard.state.link_type = "OUTER"
        ctx.wizard.next()
    }

    @WizardStep(5)
    @Action("INNER")
    async step5_inner(@Ctx() ctx: IWizardContext) {
        ctx.reply("Введите ID телеграмм канала (Убедитесь, что бот является администратором этого канала): ")
        ctx.wizard.state.link_type = "INNER"
        ctx.wizard.next()
    }

    @WizardStep(6)
    async step6_out(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
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
                await ctx.reply("Не верный формат URL!")
                return
            }

            ctx.wizard.state.link = message
        }

        const state = ctx.wizard.state

        await this.taskService.createTask({
            title: state.title,
            description: state.description,
            coins: state.coins,
            link: state.link,
            channel_id: state.channel_id,
            main_task_id: null
        })
        await ctx.reply("Задача успешно создана !")
        ctx.scene.leave()
    }


}