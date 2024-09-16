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
		const referals = await user.$get("Referrals", {
			order: [
                ["coins", "DESC"]
            ]
		})

		const info = await this.userService.usersInfo(referals)

		const returnInfo = referals.map(user => ({
            ...user.dataValues,
            ...info.find(inf => inf.id === user.id)
        }))

		const revenues = await user.$get("Revenues")

		return {
			status: "Ok",
			content: returnInfo,
			revenues: revenues?.coins ?? 0,
			next_revenues_time: revenues?.next_revenues_time ?? null,
			referals_limit: user.referals_count
		}
	}
}