import { EnumButtons } from "src/enums/buttons.enum";
import { Markup } from "telegraf";

export function actionButtons() {
    return Markup.keyboard(
        [
            Markup.button.callback(EnumButtons.CREATE_TASK, ""),
            Markup.button.callback(EnumButtons.UPDATE_TASK, ""),
            Markup.button.callback(EnumButtons.DELETE_TASK, ""),
            Markup.button.callback(EnumButtons.CREATE_SUB_TASK, ""),
            Markup.button.callback(EnumButtons.BACK, ""),
        ],

        {
            columns: 1,
        }
    )
}