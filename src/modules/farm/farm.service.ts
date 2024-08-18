import { InjectModel } from '@nestjs/sequelize'
import { Injectable } from '@nestjs/common'
import { Farm } from '../../entities/farm.model'

@Injectable()
export class FarmService {
  constructor(@InjectModel(Farm) private readonly farmRepository: typeof Farm) {
  }

  async status(userId) {
    const [farm, created] = await this.getFarm(userId)

    return this.checkStatus(farm)
  }

  async start(userId) {
    const [farm, created] = await this.getFarm(userId)

    if (farm.startTime == null) {

      farm.startTime = new Date()

      await farm.save()
    }

    return {status: this.checkStatus(farm)}
  }

  async claim(user) {
    const [farm, created] = await this.getFarm(user.id)

    const status = this.checkStatus(farm)

    if(status === 'claim') {

      farm.startTime = null
      user.coins = user.coins + 480
    }

    await user.save()
    await farm.save()

    return {status: this.checkStatus(farm)}
  }

  private getFarm(userId: number) {
    return this.farmRepository.findOrCreate({
      where: {
        userId: userId
      }
    })
  }

  private checkStatus(farm) {

    if (farm.startTime === null) {
      return 'start'
    }

    const diff = ((new Date()).getTime() - farm.startTime.getTime()) / 3600000

    if (diff >= 12) {
      return 'claim'
    }

    return 'farming'
  }
}
