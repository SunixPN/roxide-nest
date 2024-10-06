import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, QueryTypes } from 'sequelize';
import { Bonus } from 'src/entities/bonus.model';
import { Farm } from 'src/entities/farm.model';
import { ICreateUser, User } from 'src/entities/user.model';
import { TelegramService } from 'src/telegram/telegram.service';

interface IResult {
    position: string
}

@Injectable()
export class UserService {
    constructor (
        @InjectModel(User) private readonly userRepository: typeof User,
        @InjectModel(Farm) private readonly farmRepository: typeof Farm,
        @InjectModel(Bonus) private readonly bonusRepository: typeof Bonus,
        @Inject(forwardRef(() => TelegramService)) private readonly telegramService: TelegramService
        ) {}

    async createUser(new_user: ICreateUser) {
        const user = await this.userRepository.create({
            ...new_user
        })

        const farm = await this.farmRepository.create({
            startTime: null,
            userId: user.id
        })

        const bonus = await this.bonusRepository.create({
            userId: user.id,
            next_bonus_time: new Date()
        })

        await user.$set("Farm", farm)
        await user.$set("Bonus", bonus)
    }

    async usersRaiting(user: User) {
        const users = await this.userRepository.findAll({
            order: [
                ["coins", "DESC"]
            ],

            limit: 100
        })

        console.log(users.map(user => user.dataValues))

        const userPosition = await this.userRaiting(user.telegramId)

        const info = await this.usersInfo(users)

        const returnInfo = users.map(user => ({
            ...user.dataValues,
            ...info.find(inf => inf.id === user.id)
        }))

        return {
            status: "Ok",
            raiting: returnInfo,
            userPosition: +userPosition
        }
    }

    async userRaiting(telegramId: bigint) {
        const positionQuery = `
            SELECT position
            FROM (
                SELECT 
                    "telegramId", 
                    "coins", 
                    RANK() OVER (ORDER BY coins DESC) AS position
                FROM "Users"
            ) AS ranked_users
            WHERE "telegramId" = :telegramId
        `

    

        const [result] = await this.userRepository.sequelize.query<IResult>(positionQuery, {
            replacements: { telegramId },
            type: QueryTypes.SELECT
        })

        return result.position;
    }

    async usersInfo(users: User[]) {
        const info = []
		const promises = []

		for (const user of users) {
			promises.push(this.infoSet(info, user))
		}

        await Promise.all(promises)

        return info
    }

    async getAllUser(tg_id: number) {
        const users = await this.userRepository.findAll({
            where: {
                telegramId: {
                    [Op.ne]: BigInt(tg_id)
                }
            }
        })

        return users
    }

    private async infoSet(info: any, user: User) {
        const userInfo = await this.telegramService.getUserInfo(user.telegramId)

        if (userInfo?.id) {
            info.push({
                ...userInfo,
                telegramId: userInfo.id,
                ...user.dataValues,
            })
        }

        else {
            info.push({
                ...user.dataValues
            })
        }
    }
}
