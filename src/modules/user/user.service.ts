import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { QueryTypes } from 'sequelize';
import { Bonus } from 'src/entities/bonus.model';
import { Farm } from 'src/entities/farm.model';
import { Task } from 'src/entities/task.model';
import { ICreateUser, User } from 'src/entities/user.model';
import { UserTask } from 'src/entities/userTask.model';
import { TelegramService } from 'src/telegram/telegram.service';

interface IResult {
    position: number
}

@Injectable()
export class UserService {
    constructor (
        @InjectModel(User) private readonly userRepository: typeof User,
        @InjectModel(Farm) private readonly farmRepository: typeof Farm,
        @InjectModel(Bonus) private readonly bonusRepository: typeof Bonus,
        @InjectModel(Task) private readonly taskRepository: typeof Task,
        @InjectModel(UserTask) private readonly userTaskRepository: typeof UserTask,
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

        const currentDate = new Date()
        currentDate.setDate(currentDate.getDate() + 1)

        const bonus = await this.bonusRepository.create({
            userId: user.id,
            next_bonus_time: currentDate
        })

        await user.$set("Farm", farm)
        await user.$set("Bonus", bonus)

        const tasks = await this.taskRepository.findAll()

        await Promise.all(
            tasks.map(async task => {
                await this.userTaskRepository.create({
                    task_id: task.id,
                    user_id: user.id
                })
        }))
    }

    async usersRaiting(user: User) {
        const users = await this.userRepository.findAll({
            order: [
                ["coins", "DESC"]
            ],

            limit: 100
        })

        const userPosition = await this.userRaiting(user.telegramId)

        const info = await this.usersInfo(users)

        info.sort((a, b) => b.coins - a.coins)

        return {
            status: "Ok",
            raiting: info,
            userPosition: userPosition
        }
    }

    async userRaiting(telegramId: bigint) {
        const positionQuery = `
            SELECT position
            FROM (
                SELECT 
                    telegramId, 
                    coins, 
                    RANK() OVER (ORDER BY coins DESC) AS position
                FROM "Users"
            ) AS ranked_users
            WHERE telegramId = :telegramId
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

    private async infoSet(info: any, user: User) {
        const userInfo = await this.telegramService.getUserInfo(user.telegramId)

        info.push({
            ...userInfo,
            telegramId: userInfo.id,
            ...user.dataValues,
        })
    }
}
