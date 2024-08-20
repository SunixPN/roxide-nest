import { Column, Table, Model, BelongsTo, BelongsToMany } from 'sequelize-typescript'
import { INTEGER, STRING } from 'sequelize'
import { User } from './user.model'
import { UserTask } from './userTask.model'

export interface ITaskCreate {
    title: string,
    description?: string,
    link: string,
    coins?: number
}

@Table
export class Task extends Model<Task, ITaskCreate> {

  @Column({ type: STRING, allowNull: false })
  title: string

  @Column({ allowNull: true, type: STRING })
  description: string

  @Column({ allowNull: false, type: STRING })
  link: string

  @Column({ allowNull: true, type: INTEGER, defaultValue: 0 })
  coins: number

  @BelongsToMany(() => User, () => UserTask)
  users: User[]
}