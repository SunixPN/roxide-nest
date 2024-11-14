import { ApiProperty } from "@nestjs/swagger";

export class Raiting {
    @ApiProperty()
    status: string

    @ApiProperty()
    raiting: any[]

    @ApiProperty()
    userPosition: number
}