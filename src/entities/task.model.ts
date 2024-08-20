import { Column, Table, Model, BelongsTo, BelongsToMany, HasMany, ForeignKey } from 'sequelize-typescript'
import { INTEGER, STRING } from 'sequelize'
import { User } from './user.model'
import { UserTask } from './userTask.model'

export interface ITaskCreate {
    title: string,
    description?: string,
    link?: string,
    coins?: number,
    main_task_id: number
}

@Table
export class Task extends Model<Task, ITaskCreate> {

  @Column({ type: STRING, allowNull: false })
  title: string

  @Column({ allowNull: true, type: STRING })
  description: string

  @Column({ allowNull: true, type: STRING })
  link: string

  @ForeignKey(() => Task)
  @Column({ allowNull: true, type: INTEGER, onDelete: "cascade", onUpdate: "cascade" })
  main_task_id: number

  @Column({ allowNull: true, type: INTEGER, defaultValue: 0 })
  coins: number

  @HasMany(() => Task, "main_task_id")
  sub_tasks: Task[]

  @BelongsToMany(() => User, () => UserTask)
  users: User[]

  @HasMany(() => UserTask, "task_id")
  userTasks: UserTask[]
}