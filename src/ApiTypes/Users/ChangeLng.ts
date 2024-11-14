import { ApiProperty } from "@nestjs/swagger"
import { EnumLanguages } from "src/enums/languages.enum"

export class ChangeLng {
    @ApiProperty()
    status: string

    @ApiProperty()
    message: string

    @ApiProperty()
    language: EnumLanguages
}