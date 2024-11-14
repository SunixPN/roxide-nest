import { ApiProperty } from "@nestjs/swagger";
import { EnumFarmStatus } from "src/enums/farmStatus.enum";

export class FarmStart {
    @ApiProperty()
    message: string

    @ApiProperty()
    status: EnumFarmStatus
}