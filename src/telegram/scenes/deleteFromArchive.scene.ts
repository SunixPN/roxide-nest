import { Injectable } from "@nestjs/common";
import { Action, Ctx, Hears, Message, Wizard, WizardStep } from "nestjs-telegraf";
import { TaskService } from "src/modules/task/task.service";
import { IWizardContext } from "./create.scene";
import { EnumButtons } from "src/enums/buttons.enum";
import { Markup } from "telegraf";

@Injectable()
@Wizard("delete-from-archive")
export class DeleteFromArchive {

    constructor(private readonly taskService: TaskService) {}

    @Hears(EnumButtons.BACK)
    async back(@Ctx() ctx: IWizardContext) {
        await ctx.reply("Select an action: ")
        ctx.scene.leave() 
    }

    @WizardStep(1)
    async step1(@Ctx() ctx: IWizardContext) {
        const tasks = await this.taskService.getAllTaskFromArchive();

        if (tasks.length === 0) {
            await ctx.reply("No tasks found.");
            return ctx.scene.leave();
        }

        const buttons = tasks.map(task => 
            Markup.button.callback(task.title, `delete_task_${task.id}`)
        )

        await ctx.reply("Select a task to delete from archive:", Markup.inlineKeyboard(buttons, { columns: 1 }));
        ctx.wizard.next();
    }

    @Action(/^delete_task_(\d+)$/)
    async deleteTask(@Ctx() ctx: IWizardContext) {
        if ("callback_query" in ctx.update && "data" in ctx.update.callback_query) {
            
            try {
                const data = ctx.update.callback_query.data as string
                const id = data.split("_")[2]
                console.log(id)

                await this.taskService.deleteFromArchive(parseInt(id))
                await ctx.reply("Task has been deleted from archive successfully.");
    
                ctx.scene.leave();
            } catch (error) {
                await ctx.answerCbQuery("Failed to delete the task.", { show_alert: true });
            }
        }

        else {
            await ctx.answerCbQuery("Failed to delete the task.", { show_alert: true });
        }
    }
}