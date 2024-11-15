import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { TelegramService } from 'src/telegram/telegram.service';
import axios from 'axios';

@Controller('proxy')
export class ProxyController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get("avatar/:telegramId")
  async getUserAvatar(@Param('telegramId') telegramId: string, @Res() res: Response) {
    try {
      const fileUrl = await this.telegramService.getPhoto(telegramId)
      if (fileUrl) {
        const response = await axios.get(fileUrl, { responseType: "stream" })
        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res); 
      }

      else {
        res.status(404).send('Avatar not found');
      }
      
    }

    catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
    }
  }

  @Get("main_task/:file_id")
  async getMainTaskPicture(@Param('file_id') file_id: string, @Res() res: Response) {
    try {
      const fileHref = await this.telegramService.getFile(file_id)
      if (fileHref) {
        const response = await axios.get(fileHref, { responseType: "stream" })
        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res); 
      }

      else {
        res.status(404).send('Picture not found');
      }
      
    }

    catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
    }
  }
}
