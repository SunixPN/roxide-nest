import { Injectable } from '@nestjs/common'
import { User } from '../../entities/user.model'
import { TelegramService } from 'src/telegram/telegram.service'
import { UserService } from '../user/user.service'
import { randomColor } from 'src/helpers/randomColor'

@Injectable()
export class ReferralService {
	constructor(
		private readonly telegramService: TelegramService,
		private readonly userService: UserService
	) {
	}

	async referrals(user: User) {
		const referals = await user.$get("Referrals", {
			order: [
                ["coins", "DESC"]
            ]
		})

		const info = await this.userService.usersInfo(referals)

		const returnInfo = referals.map(user => ({
			photo: info.find(inf => inf.id === user.id).photo,
			active_usernames: info.find(inf => inf.id === user.id).active_usernames,
			coins: user.coins,
			day_revenues: user.day_revenues,
			first_name: info.find(inf => inf.id === user.id).first_name,
			last_name: info.find(inf => inf.id === user.id).last_name,
			color: user.color
            // ...user.dataValues,
            // ...info.find(inf => inf.id === user.id)
        }))

		const revenues = await user.$get("Revenues")

		return {
			status: "Ok",
			content: returnInfo,
			revenues: revenues?.coins ?? 0,
			next_revenues_time: revenues?.next_revenues_time ?? null
		}
	}
}