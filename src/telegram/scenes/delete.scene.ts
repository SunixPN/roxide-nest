import { Injectable } from "@nestjs/common";
import { Ctx, Hears, Action, Wizard, WizardStep } from "nestjs-telegraf";
import { TaskService } from "src/modules/task/task.service";
import { EnumButtons } from "src/enums/buttons.enum";
import { Markup, Scenes } from "telegraf";
import { WizardContext } from "telegraf/typings/scenes";

@Injectable()
@Wizard("delete-task")
export class DeleteScene {

    constructor(private readonly taskService: TaskService) {}

    @Hears(EnumButtons.BACK)
    async back(@Ctx() ctx: WizardContext) {
        await ctx.reply("Select an action: ");
        ctx.scene.leave();
    }

    @WizardStep(1)
    async step1(@Ctx() ctx: WizardContext) {
        const tasks = await this.taskService.getAllTasks();

        if (tasks.length === 0) {
            await ctx.reply("No tasks found.");
            return ctx.scene.leave();
        }

        const buttons = tasks.map(task => 
            Markup.button.callback(task.title, task.sub_tasks.length === 0 ? `delete_task_${task.id}` : `delete_task_sub_${task.id}`)
        )

        await ctx.reply("Select a task to delete:", Markup.inlineKeyboard(buttons, { columns: 1 }));
        ctx.wizard.next();
    }

    @Action(/^delete_task_sub_(\d+)$/)
    async delSub(@Ctx() ctx: WizardContext) {
        if ("callback_query" in ctx.update && "data" in ctx.update.callback_query) {
            const data = ctx.update.callback_query.data as string
            const id = data.split("_")[3]

            const subTasks = await this.taskService.getAllSubTasks(parseInt(id))

            const buttons = subTasks.map(task =>
                Markup.button.callback(task.title, `delete_task_${task.id}`)
            )

            await ctx.reply("Select a sub-task to delete:", Markup.inlineKeyboard([...buttons, Markup.button.callback("Delete main", `delete_task_${id}`)], { columns: 1 }));
        }

        else {
            await ctx.answerCbQuery("Failed to delete the task.", { show_alert: true });
        }
    }

    @Action(/^delete_task_(\d+)$/)
    async deleteTask(@Ctx() ctx: WizardContext) {
        console.log(ctx.update)
        if ("callback_query" in ctx.update && "data" in ctx.update.callback_query) {
            try {
                const data = ctx.update.callback_query.data as string
                const id = data.split("_")[2]
                console.log(id)

                await this.taskService.deleteTask(parseInt(id))
                await ctx.reply("Task has been deleted successfully.");
    
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