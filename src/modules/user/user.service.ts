import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Bonus } from 'src/entities/bonus.model';
import { Farm } from 'src/entities/farm.model';
import { Task } from 'src/entities/task.model';
import { ICreateUser, User } from 'src/entities/user.model';
import { UserTask } from 'src/entities/userTask.model';

@Injectable()
export class UserService {
    constructor (
        @InjectModel(User) private readonly userRepository: typeof User,
        @InjectModel(Farm) private readonly farmRepository: typeof Farm,
        @InjectModel(Bonus) private readonly bonusRepository: typeof Bonus,
        @InjectModel(Task) private readonly taskRepository: typeof Task,
        @InjectModel(UserTask) private readonly userTaskRepository: typeof UserTask
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

    async referalUserList(user: User) {
        const referals = await user.$get("Referrals", {
            order: [["coins", "DESC"]]
        })

        return {
            status: "Ok",
            content: referals
        }
    }
}
