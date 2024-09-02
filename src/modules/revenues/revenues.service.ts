import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Revenues } from 'src/entities/revenues.model';
import { User } from 'src/entities/user.model';

@Injectable()
export class RevenuesService {
    constructor(@InjectModel(Revenues) private readonly revenuesRepository: typeof Revenues) {}

    async claimRevenues(user: User) {
        const revenues = await this.revenuesRepository.findOne({
            where: {
                userId: user.id
            }
        })

        if (revenues.next_revenues_time.getTime() > new Date().getTime()) {
            throw new BadRequestException("You can not claim revenues")
        }

        const referalsList = await user.$get("Referrals")

        await Promise.all(referalsList.map(async ref => {
            ref.day_revenues = 0
            await ref.save()
        }))

        const currentDate = new Date()
        currentDate.setDate(currentDate.getDate() + 1)

        revenues.next_revenues_time = currentDate
        user.coins += revenues.coins
        revenues.coins = 0

        await revenues.save()
        await user.save()

        return {
            status: "Ok",
            message: "You are successfully claim revenues"
        }
    }
}
