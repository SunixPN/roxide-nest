import { InjectModel } from '@nestjs/sequelize'
import { BadRequestException, Injectable } from '@nestjs/common'
import { Farm } from '../../entities/farm.model'
import { EnumFarmStatus } from 'src/enums/farmStatus.enum'
import { User } from 'src/entities/user.model'

@Injectable()
export class FarmService {
  constructor(@InjectModel(Farm) private readonly farmRepository: typeof Farm) {
  }

  async status(user: User) {
    const [farm] = await this.getFarm(user.id)

    return {
      status: this.checkStatus(farm),
      start_time: farm.startTime,
      coins: user.coins
    }
  }

  async start(userId: number) {
    const [farm] = await this.getFarm(userId)

    if (farm.startTime == null) {

      farm.startTime = new Date()

      await farm.save()
    }

    else {
      throw new BadRequestException("Farm has already been started")
    }

    return {
        message: "Farm is successfuly start",
        status: this.checkStatus(farm)
    }
  }

  async claim(user: User) {
    const [farm] = await this.getFarm(user.id)

    const status = this.checkStatus(farm)

    if (status === EnumFarmStatus.CLAIM) {

      farm.startTime = null
      user.coins = user.coins + 480

      await user.save()
      await farm.save()
  
      return {
          message: "Farm is Successfully claim",
          status: this.checkStatus(farm)
      }
    }

    else {
      throw new BadRequestException("You can not claim now")
    }
  }

  private getFarm(userId: number) {
    return this.farmRepository.findOrCreate({
      where: {
        userId: userId
      }
    })
  }

  private checkStatus(farm: Farm) {

    if (farm.startTime === null) {
      return EnumFarmStatus.START
    }

    const diff = ((new Date()).getTime() - farm.startTime.getTime()) / 3600000

    if (diff >= 12) {
      return EnumFarmStatus.CLAIM
    }

    return EnumFarmStatus.FARMING
  }
}
