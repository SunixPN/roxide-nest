import { Module } from '@nestjs/common'
import { PhotoService } from './photo.service'

@Module({
  controllers: [],
  providers: [PhotoService],
  exports: [PhotoService]
})
export class PhotoModule {
}