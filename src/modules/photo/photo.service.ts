import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { generateRandomString } from "../../helpers/getRandomString"

@Injectable()
export class PhotoService {
  private readonly publicPath = path.join(__dirname, "../../../", 'public');

  async downloadAndSavePhoto(fileUrl: string, file: string): Promise<string> {
    const fileName = generateRandomString()
    const localFilePath = path.join(this.publicPath, fileName + file);
    
    const response = await axios.get(fileUrl, { responseType: 'stream' });
    const writer = fs.createWriteStream(localFilePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    
    return `/public/${fileName + file}`;
  }
}