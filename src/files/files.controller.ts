import { Controller, Get, Param, Res } from '@nestjs/common';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get("/:filename")
  async getFile(@Param("filename") filename: string, @Res() res: any) {
    res.sendFile(filename, { root: "/public" })
  }
}
