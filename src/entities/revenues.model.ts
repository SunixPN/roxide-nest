import { Column, Table, Model, ForeignKey, BelongsTo } from 'sequelize-typescript'
import { DATE, FLOAT, INTEGER } from 'sequelize'
import { User } from './user.model'

interface IRevenuesCreate {
    next_revenues_time: Date,
    userId: number
}

@Table
export class Revenues extends Model<Revenues, IRevenuesCreate> {

  @ForeignKey(() => User)
  @Column({ type: INTEGER, allowNull: false, onDelete: 'cascade', onUpdate: 'cascade' })
  userId: number

  @Column({ allowNull: false, type: DATE })
  next_revenues_time: Date

  @Column({ allowNull: false, type: FLOAT, defaultValue: 0 })
  coins: number

  @BelongsTo(() => User)
  User: User
}