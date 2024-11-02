import { IsEnum } from "class-validator";
import { EnumLanguages } from "src/enums/languages.enum";

export class ChangeLanguageDto {
    @IsEnum(EnumLanguages)
    lng: EnumLanguages
}