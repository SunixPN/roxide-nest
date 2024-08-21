import { Injectable } from '@nestjs/common'
import { User } from '../../entities/user.model'
import { TelegramService } from 'src/telegram/telegram.service'

@Injectable()
export class ReferralService {
	constructor(
		private readonly telegramService: TelegramService
	) {
	}

	async index() {


	}

	async referrals(user: User) {
		const referals = await user.$get("Referrals")

		const info = []
		const promises = []

		for (const ref of referals) {
			promises.push(this.setInfo(info, ref))
		}

		await Promise.all(promises)

		info.sort((a, b) => b.coins - a.coins)


		return {
			status: "Ok",
			content: info
		}
	}

	private async setInfo(info: any[], referal: User) {
		const userInfo = await this.telegramService.getUserInfo(referal.telegramId)

		info.push({
			...userInfo,
			telegramId: userInfo.id,
			...referal.dataValues,
		})

	}
}