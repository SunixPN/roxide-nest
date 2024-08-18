import { InjectModel } from '@nestjs/sequelize'
import { Injectable } from '@nestjs/common'
import { User } from '../../entities/user.model'

@Injectable()
export class ReferralService {
  constructor(@InjectModel(User) private readonly userRepository: typeof User) {
  }

  async index() {


  }

  async referrals(userId: number) {
    const user = await this.userRepository.findByPk(userId, {
      include: ['Referrals']
    })

    const response = []

    for (const ref of user.Referrals) {
      response.push({
        telegramId: ref.id,
        coins: ref.coins
      })
    }

    return response
  }
}