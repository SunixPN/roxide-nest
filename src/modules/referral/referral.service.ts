import { Injectable } from '@nestjs/common'
import { User } from '../../entities/user.model'
import { TelegramService } from 'src/telegram/telegram.service'
import { UserService } from '../user/user.service'

@Injectable()
export class ReferralService {
	constructor(
		private readonly telegramService: TelegramService,
		private readonly userService: UserService
	) {
	}

	async index() {


	}

	async referrals(user: User) {
		const referals = await user.$get("Referrals")

		const info = await this.userService.usersInfo(referals)

		info.sort((a, b) => b.coins - a.coins)


		return {
			status: "Ok",
			content: info
		}
	}
}