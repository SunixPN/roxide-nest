import { ApiProperty } from "@nestjs/swagger";
import { EnumFarmStatus } from "src/enums/farmStatus.enum";
import { EnumLanguages } from "src/enums/languages.enum";

export class StatusResponse {
    @ApiProperty()
    status: EnumFarmStatus

    @ApiProperty()
    start_time: Date | null

    @ApiProperty()
    coins: number
    
    @ApiProperty()
    language: EnumLanguages
}