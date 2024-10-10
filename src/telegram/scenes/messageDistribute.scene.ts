import { Injectable } from "@nestjs/common";
import { Action, Ctx, Hears, Message, On, Wizard, WizardStep } from "nestjs-telegraf";
import { EnumButtons } from "src/enums/buttons.enum";
import { UserService } from "src/modules/user/user.service";
import { Markup, Scenes } from "telegraf";
import { PhotoSize } from "telegraf/typings/core/types/typegram";
import { WizardContext } from "telegraf/typings/scenes";

interface MyWizard extends Scenes.WizardContextWizard<Scenes.WizardContext<Scenes.WizardSessionData>> {
    state: {
        message: string,
        photo: PhotoSize
    }
}

interface IWizardContextMessage extends WizardContext {
    wizard: MyWizard
}

@Injectable()
@Wizard("message")
export class MessageDistributeScene {

    constructor(private readonly userService: UserService) { }

    @Hears(EnumButtons.BACK)
    async back(@Ctx() ctx: IWizardContextMessage) {
        await ctx.reply("Select an action: ")
        ctx.scene.leave()
    }

    @WizardStep(1)
    async step1(@Ctx() ctx: IWizardContextMessage) {
        await ctx.reply("Enter the message to be sent out: ")
        ctx.wizard.next()
    }

    @WizardStep(2)
    async step2(@Message("text") message: string, @Ctx() ctx: IWizardContextMessage) {
        ctx.wizard.state.message = message
        await ctx.reply(`Confirm action or add picture: The message you want to send\n${message}`, Markup.inlineKeyboard(
            [
                Markup.button.callback("Confirm", "CF"),
                Markup.button.callback("Add picture", "PC"),
                Markup.button.callback("Reject", "RG"),
            ]
        ))
        ctx.wizard.next()
    }

    @WizardStep(3)
    @On("message")
    async step3_message(@Ctx() ctx: IWizardContextMessage) {
        await ctx.reply(`Confirm action or add picture: The message you want to send\n${ctx.wizard.state.message}`, Markup.inlineKeyboard(
            [
                Markup.button.callback("Confirm", "CF"),
                Markup.button.callback("Add picture", "PC"),
                Markup.button.callback("Reject", "RG"),
            ]
        ))
    }

    @WizardStep(3)
    @Action("CF")
    async step3_reg(@Ctx() ctx: IWizardContextMessage) {
        const users = await this.userService.getAllUser(ctx.from.id)
        await Promise.all(users.map(async user => {
            try {
                await ctx.telegram.sendMessage(
                    user.telegramId.toString(),
                    ctx.wizard.state.message,
                    { parse_mode: "HTML", }
                )
            }

            catch (error) {
                console.log(error.message)
            }
        }))

        await ctx.reply('Broadcast message sent to all users.');
        ctx.scene.leave()
    }

    @WizardStep(3)
    @Action("RG")
    async step3_conf(@Ctx() ctx: IWizardContextMessage) {
        ctx.wizard.selectStep(0);
        await this.step1(ctx);
    }

    @WizardStep(3)
    @Action("PC")
    async step3_picture(@Ctx() ctx: IWizardContextMessage) {
        await ctx.reply("Please, download your image")
        ctx.wizard.next()
    }

    @WizardStep(4)
    @On("photo")
    async onPhoto(@Ctx() ctx: IWizardContextMessage) {
        let photo: PhotoSize
        if ("photo" in ctx.message) {
            photo = ctx.message.photo.at(-1)
        }

        ctx.wizard.state.photo = photo
        await ctx.reply("Confirm the message you want to send")
        await ctx.replyWithPhoto(ctx.wizard.state.photo.file_id, {
            caption: ctx.wizard.state.message,
            ...Markup.inlineKeyboard(
                [
                    Markup.button.callback("Confirm", "Conf"),
                    Markup.button.callback("Reject", "Reg"),
                ]
            )
        })

        ctx.wizard.next()
    }

    @WizardStep(5)
    @Action("Conf")
    async step6_message(@Ctx() ctx: IWizardContextMessage) {
        const users = await this.userService.getAllUser(ctx.from.id)
        await Promise.all(users.map(async user => {
            try {
                await ctx.telegram.sendPhoto(
                    user.telegramId.toString(),
                    ctx.wizard.state.photo.file_id,
                    {
                        caption: ctx.wizard.state.message,
                        parse_mode: "HTML"
                    }
                )
            }

            catch (error) {
                console.log(error.message)
            }
        }))

        await ctx.reply('Broadcast message sent to all users.');
        ctx.scene.leave()
    }

    @WizardStep(5)
    @Action("Reg")
    async step6_reg(@Ctx() ctx: IWizardContextMessage) {
        ctx.wizard.selectStep(1);
        await this.step2(ctx.wizard.state.message, ctx);
    }
}