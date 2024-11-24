import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.model';
import { EnumBonusStatus } from 'src/enums/bonusStatus.enum';
import { bonusSwitch } from 'src/helpers/bonus';

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

        let welcome_status: boolean

        const welcomeTime = bonus.next_welcome_date.getTime()
        const timeWelcomeDifference = currentTime - welcomeTime
        
        if (timeWelcomeDifference >= 0) {
            welcome_status = true

            const currentDate = new Date()
            currentDate.setDate(currentDate.getDate() + 3)

            bonus.next_welcome_date = currentDate

            await bonus.save()
        }

        else {
            welcome_status = false
        }

        return {
            next_bonus_time: bonus.next_bonus_time,
            status: status,
            day: bonus.currentDay,
            welcome_status: welcome_status
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

        const bonusCoins = bonusSwitch(bonus.currentDay + 1)
        
        user.coins += bonusCoins

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
