import { ApiProperty } from "@nestjs/swagger";

export class My {
    @ApiProperty()
    status: string

    @ApiProperty()
    content: any[]

    @ApiProperty()
    revenues: number

    @ApiProperty()
    next_revenues_time: Date | null
}