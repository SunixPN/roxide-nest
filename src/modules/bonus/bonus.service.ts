import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.model';
import { EnumBonusStatus } from 'src/enums/bonusStatus.enum';

@Injectable()
export class BonusService {
    async bonusStatus(user: User) {
        const bonus = await user.$get("Bonus")

        let status: EnumBonusStatus

        const currentTime = new Date().getTime()
        const nextBonusTime = bonus.next_bonus_time.getTime()

        const timeDifference = currentTime - nextBonusTime

        const dayDifference = timeDifference / (1000 * 60 * 60 * 24)

        if (dayDifference >= 1 && bonus.currentDay !== 0) {
            status = EnumBonusStatus.CLAIM
            bonus.currentDay = 0
            await bonus.save()

            return {
                next_bonus_time: bonus.next_bonus_time,
                status: status,
                day: bonus.currentDay
            }
        }

        if (bonus.next_bonus_time.getTime() <= new Date().getTime()) {
            status = EnumBonusStatus.CLAIM
        }

        else {
            status = EnumBonusStatus.WAIT
        }

        return {
            next_bonus_time: bonus.next_bonus_time,
            status: status,
            day: bonus.currentDay
        }
    }

    async bonusClaim(user: User) {
        const bonus = await user.$get("Bonus")

        if (bonus.next_bonus_time.getTime() > new Date().getTime()) {
            throw new BadRequestException("You can not claim the bonus")
        }

        const currentTime = new Date().getTime()
        const nextBonusTime = bonus.next_bonus_time.getTime()

        const timeDifference = currentTime - nextBonusTime

        const dayDifference = timeDifference / (1000 * 60 * 60 * 24)

        if (dayDifference >= 1 && bonus.currentDay !== 0) {
            bonus.currentDay = 0

            await bonus.save()
        }
        
        user.coins += 50 * (bonus.currentDay + 1)

        bonus.currentDay = bonus.currentDay === 6 ? 0 : bonus.currentDay + 1

        const currentDate = new Date()
        currentDate.setDate(currentDate.getDate() + 1)

        bonus.next_bonus_time = currentDate

        await user.save()
        await bonus.save()

        return {
            message: "Bonus successfully claim"
        }
    }
}
