import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ITaskCreate, Task } from 'src/entities/task.model';
import { User } from 'src/entities/user.model';
import { UserTask } from 'src/entities/userTask.model';
import { EnumTaskStatus } from 'src/enums/taskStatus.enum';
import { TelegramService } from 'src/telegram/telegram.service';

@Injectable()
export class TaskService {
    constructor(
        @InjectModel(Task) private readonly taskRepository: typeof Task,
        @InjectModel(User) private readonly userRepository: typeof User,
        @InjectModel(UserTask) private readonly userTaskRepository: typeof UserTask,
        @Inject(forwardRef(() => TelegramService)) private readonly telegramService: TelegramService
    ) {}

    async createTask(task: ITaskCreate) {
        const taskWithTitle = await this.taskRepository.findOne({
            where: {
                title: task.title
            }
        })

        if (taskWithTitle) {
            throw new BadRequestException("Task with current title is Exist!")
        }
        
        const newTask = await this.taskRepository.create({
            ...task
        })

        return {
            status: "created",
            task: newTask
        }
    }

    async findTaskByName(title: string, dont_check: boolean = false) {
        const task = await this.taskRepository.findOne({
            where: {
                title: title
            }
        })

        if (!task && !dont_check) {
            throw new BadRequestException("Task not found")
        }

        return task
    }

    async createSubTask(task: ITaskCreate, main_task_id: number) {
        const newTask = await this.taskRepository.create({
            ...task,
            main_task_id: main_task_id
        })

        return {
            status: "created",
            task: newTask
        }
    }

    async deleteTask(task_id: number) {
        const deleteTask = await this.findTask(task_id)

        await deleteTask.destroy()
    }

    async updateTask(task: ITaskCreate, id: number) {
        const updateTask = await this.findTask(id)

        await updateTask.update({
            title: task.title ?? updateTask.title,
            description: task.description ?? updateTask.description,
            link: task.link ?? updateTask.link,
            channel_id: task.channel_id ?? updateTask.channel_id,
            coins: task.coins ?? updateTask.coins,
            icon: task.icon ?? updateTask.icon
        })
    }

    async getAllTasksWithUser(user: User) {
        const tasks = await this.taskRepository.findAll({
            where: {
                main_task_id: null
            },

            include: [
                {
                    model: Task,
                    as: "sub_tasks",
                    include: [
                        {
                            model: UserTask,
                            where: {
                                user_id: user.id
                            },
                            required: false
                        }
                    ]
                },
                {
                    model: UserTask,
                    where: {
                        user_id: user.id
                    },
                    required: false
                }
            ],

            order: [
                ["id", "DESC"],
                ["sub_tasks", "id", "DESC"]
            ]
        })

        return {
            status: "Ok",
            content: [
                ...tasks.map(task => ({
                    ...task.dataValues,
                    sub_tasks: task.dataValues.sub_tasks.map(sub => ({
                        ...sub.dataValues,
                        userTasks: undefined,
                        status: sub.userTasks[0]?.task_status ?? EnumTaskStatus.PENDING
                    })),
                    userTasks: undefined,
                    status: task.userTasks[0]?.task_status ?? EnumTaskStatus.PENDING
                }))
            ]
        }
    }

    async getTaskWithUserById(user: User, id: number) {
        const task = await this.taskRepository.findOne({
            where: {
                id: id
            },

            include: [
                {
                    model: UserTask,
                    where: {
                        user_id: user.id
                    },

                    required: false
                }
            ]
        })

        return {
            ...task.dataValues,
            status: task.userTasks[0]?.task_status ?? EnumTaskStatus.PENDING
        }
    }

    async findTask(id: number) {
        const task = await this.taskRepository.findByPk(id)

        if (!task) {
            throw new BadRequestException("Task not found")
        }

        return task
    }

    private async findUserTask(user_id: number, task_id: number, no_check: boolean = false) {
        const userTask = await this.userTaskRepository.findOne({
            where: {
                user_id: user_id,
                task_id: task_id
            }
        })

        if (!userTask && !no_check) {
            throw new BadRequestException("No task by this user was found")
        }

        return userTask
    }

    async startTask(user: User, id: number) {
        const task = await this.findTask(id)

        const userTaskFind = await this.findUserTask(user.id, task.id, true)

        if (userTaskFind) {
            throw new BadRequestException("You can not start this task")
        }

        const userTask = await this.userTaskRepository.create({
            task_id: id,
            user_id: user.id
        })

        if (task.main_task_id) {
            const userMainTaskFind = await this.findUserTask(user.id, task.main_task_id, true)

            if (!userMainTaskFind) {
                const userMainTask = await this.userTaskRepository.create({
                    task_id: task.main_task_id,
                    user_id: user.id,
                })

                userMainTask.task_status = EnumTaskStatus.IN_PROGRESS

                await userMainTask.save()
            }
        }

        if (task.link) {
            userTask.task_status = EnumTaskStatus.COMPLETED
        }

        else {
            userTask.task_status = EnumTaskStatus.IN_PROGRESS
        }

        await userTask.save()

        return {
            message: "Task is successfuly start",
            status: userTask.task_status
        }
    }

    async completeMainTask(user: User, main_id: number) {
        const userTask = await this.findUserTask(user.id, main_id)
        const mainTask = await this.findTask(main_id)

        console.log(mainTask)

        if (mainTask.main_task_id || mainTask.sub_tasks.length === 0) {
            throw new BadRequestException("You can not complete this task")
        }

        const userSubTasks = await this.userTaskRepository.findAll({
            where: {
                user_id: user.id,
                task_id: userTask.task.sub_tasks.map(task => task.id)
            }
        })

        const isAllStartSubTasks = userSubTasks.length === mainTask.sub_tasks.length

        if (userSubTasks.every(userTask => userTask.task_status === EnumTaskStatus.COMPLETED ) && isAllStartSubTasks) {
            userTask.task_status = EnumTaskStatus.COMPLETED

            await userTask.save()
    
            return {
                message: "Task is successfuly update",
                status: userTask.task_status
            }
        }

        throw new BadRequestException("You can not complete this task")
    }

    private async updateMainTask(task: Task, user: User) {
        if (task.main_task_id) {
            const mainTask = await this.taskRepository.findOne({
                where: {
                    id: task.main_task_id
                },

                include: {
                    model: Task,
                    as: "sub_tasks"
                }
            })

            const userSubTasks = await this.userTaskRepository.findAll({
                where: {
                    user_id: user.id,
                    task_id: mainTask.sub_tasks.map(task => task.id) 
                }
            })

            const isAllStartSubTasks = userSubTasks.length === mainTask.sub_tasks.length

            if (userSubTasks.every(userTask => userTask.task_status === EnumTaskStatus.COMPLETED ) && isAllStartSubTasks) {
                const userMainTask = await this.findUserTask(user.id, task.main_task_id)

                userMainTask.task_status = EnumTaskStatus.COMPLETED

                await userMainTask.save()
            }
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

        await this.updateMainTask(task, user)

        return {
            url: link
        }
    }

    async claimTaskCoins(user: User, id: number) {
        const task = await this.findTask(id)

        const userTask = await this.findUserTask(user.id, task.id)

        if (userTask.task_status !== EnumTaskStatus.COMPLETED || task.main_task_id) {
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

    async checkSubscribe(user: User, id: number) {
        const task = await this.findTask(id)

        if (!task.dataValues.channel_id) {
            throw new BadRequestException("There are no channel for this task")
        }

        const userTask = await this.findUserTask(user.id, task.id)

        if (userTask.task_status !== EnumTaskStatus.IN_PROGRESS) {
            throw new BadRequestException("You can not complete this task")
        }

        await this.telegramService.checkSubscribe(user.telegramId, task.dataValues.channel_id)

        userTask.task_status = EnumTaskStatus.COMPLETED

        await userTask.save()

        await this.updateMainTask(task, user)

        return {
            message: 'You are subscribed',
            status: userTask.task_status
        }
    }
}
