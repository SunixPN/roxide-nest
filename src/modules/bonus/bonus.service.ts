import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.model';
import { EnumBonusStatus } from 'src/enums/bonusStatus.enum';

@Injectable()
export class BonusService {
    async bonusStatus(user: User) {
        const bonus = await user.$get("Bonus")

        let status: EnumBonusStatus

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
        
        user.coins += 50 * (bonus.currentDay + 1)

        bonus.currentDay = bonus.currentDay === 9 ? 0 : bonus.currentDay + 1

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
