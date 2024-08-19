import { Column, Table, Model, ForeignKey, BelongsTo } from 'sequelize-typescript'
import { DATE, INTEGER } from 'sequelize'
import { User } from './user.model'

interface IFarmCreate {
  startTime: Date | null
}

@Table
export class Farm extends Model<Farm> {

  @ForeignKey(() => User)
  @Column({ type: INTEGER, allowNull: false, onDelete: 'cascade', onUpdate: 'cascade' })
  userId: number

  @Column({ allowNull: true, type: DATE })
  startTime: Date

  @BelongsTo(() => User)
  User: User
}