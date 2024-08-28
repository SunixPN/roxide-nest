import { Injectable } from "@nestjs/common";
import { Ctx, Hears, Message, Wizard, WizardStep } from "nestjs-telegraf";
import { TaskService } from "src/modules/task/task.service";
import { IWizardContext } from "./create.scene";
import { EnumButtons } from "src/enums/buttons.enum";

@Injectable()
@Wizard("delete-task")
export class DeleteScene {

    constructor(private readonly taskService: TaskService) {}

    @Hears(EnumButtons.BACK)
    async back(@Ctx() ctx: IWizardContext) {
        await ctx.reply("Выберите действие: ")
        ctx.scene.leave() 
    }

    @WizardStep(1)
    async step1(@Ctx() ctx: IWizardContext) {
        await ctx.reply("Введите название задачи которую хотите удалить: ")
        ctx.wizard.next()
    }

    @WizardStep(2)
    async step2(@Message("text") message: string, @Ctx() ctx: IWizardContext) {
        try {
            const task = await this.taskService.findTaskByName(message)
            await this.taskService.deleteTask(task.id)
            
            ctx.reply("Задача успешно удалена!")
            ctx.scene.leave()
        }

        catch {
            await ctx.reply("Данной задачи не было найдено, повторите попытку: ")
            return
        }
    }
}