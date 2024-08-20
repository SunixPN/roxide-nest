import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ITaskCreate, Task } from 'src/entities/task.model';
import { User } from 'src/entities/user.model';
import { UserTask } from 'src/entities/userTask.model';
import { EnumTaskStatus } from 'src/enums/taskStatus.enum';

@Injectable()
export class TaskService {
    constructor(
        @InjectModel(Task) private readonly taskRepository: typeof Task,
        @InjectModel(User) private readonly userRepository: typeof User,
        @InjectModel(UserTask) private readonly userTaskRepository: typeof UserTask
    ) {}

    async createTask(task: ITaskCreate) {
        const newTask = await this.taskRepository.create({
            ...task
        })

        const users = await this.userRepository.findAll()

        await Promise.all(
            users.map(async user => {
                await this.userTaskRepository.create({
                    user_id: user.id,
                    task_id: newTask.id,
                })
            })
        )

        return {
            status: "created",
            task: newTask
        }
    }

    async createSubTask(task: ITaskCreate, main_task_id: number) {
        const newTask = await this.taskRepository.create({
            ...task,
            main_task_id: main_task_id
        })

        const users = await this.userRepository.findAll()

        await Promise.all(
            users.map(async user => {
                await this.userTaskRepository.create({
                    user_id: user.id,
                    task_id: newTask.id,
                })
            })
        )

        return {
            status: "created",
            task: newTask
        }
    }

    async getAllTasksWithUser(user: User) {
        const userTasks = await this.userTaskRepository.findAll({
            where: {
                user_id: user.id,
            },

            include: [{
                model: Task,
                where: {
                    main_task_id: null
                },

                include: [
                    {
                        model: Task,
                        as: "sub_tasks"
                    }
                ]
            }]
        })

        return {
            status: "Ok",
            content: [
                ...userTasks.map(userTask => ({
                    ...userTask.task.dataValues,
                    status: userTask.task_status,
                }))
            ]
        }
    }

    async getTaskWithUserById(user: User, id: number) {
        const userTask = await this.findUserTask(user.id, id)

        return {
            ...userTask.task.dataValues,
            status: userTask.task_status
        }
    }

    private async findTask(id: number) {
        const task = await this.taskRepository.findByPk(id)

        if (!task) {
            throw new BadRequestException("Task not found")
        }

        return task
    }

    private async findUserTask(user_id: number, task_id: number) {
        const userTask = await this.userTaskRepository.findOne({
            where: {
                user_id: user_id,
                task_id: task_id
            }
        })

        if (!userTask) {
            throw new BadRequestException("No task by this user was found")
        }

        return userTask
    }

    async startTask(user: User, id: number) {
        const task = await this.findTask(id)

        const userTask = await this.findUserTask(user.id, task.id)

        if (userTask.task_status !== EnumTaskStatus.PENDING) {
            throw new BadRequestException("You can not start this task")
        }

        userTask.task_status = EnumTaskStatus.IN_PROGRESS

        await userTask.save()

        return {
            message: "Task is successfuly start",
            status: userTask.task_status
        }
    }

    async goToLink(link: string, id: number, telegram_id: number) {
        const user = await this.userRepository.findOne({
            where: {
                telegramId: telegram_id 
            }
        })

        if (!user) {
            throw new BadRequestException("User not found")
        }

        const task = await this.findTask(id)

        if (task.dataValues.link !== link) {
            throw new BadRequestException("Invalid task link")
        }

        const userTask = await this.findUserTask(user.id, task.id)

        if (userTask.task_status !== EnumTaskStatus.IN_PROGRESS) {
            throw new BadRequestException("You can not complete this task")
        }

        userTask.task_status = EnumTaskStatus.COMPLETED

        await userTask.save()

        return {
            url: link
        }
    }

    async claimTaskCoins(user: User, id: number) {
        const task = await this.findTask(id)

        const userTask = await this.findUserTask(user.id, task.id)

        if (userTask.task_status !== EnumTaskStatus.COMPLETED) {
            throw new BadRequestException("You can not claim coins from this task")
        }

        userTask.task_status = EnumTaskStatus.CLAIMED
        user.coins += task.coins

        await user.save()
        await userTask.save()

        return {
            message: 'Coins successfully claim',
            status: userTask.task_status
        }
    }
}
