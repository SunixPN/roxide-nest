import { Column, Table, Model, BelongsTo, ForeignKey } from 'sequelize-typescript'
import { INTEGER, STRING } from 'sequelize'
import { User } from './user.model'
import { Task } from './task.model'
import { EnumTaskStatus } from 'src/enums/taskStatus.enum'

interface IUserTaskCreate {
    user_id: number,
    task_id: number
}

@Table
export class UserTask extends Model<UserTask, IUserTaskCreate> {
  @ForeignKey(() => User)
  @Column({ type: INTEGER, allowNull: false })
  user_id: number

  @ForeignKey(() => Task)
  @Column({ allowNull: false, type: INTEGER })
  task_id: number

  @Column({ allowNull: false, type: STRING, defaultValue: "pending" })
  task_status: EnumTaskStatus

  @BelongsTo(() => User)
  user: User

  @BelongsTo(() => Task)
  task: Task
}