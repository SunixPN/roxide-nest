import { Column, Table, Model, HasOne, ForeignKey, HasMany, BelongsTo } from 'sequelize-typescript'
import { BIGINT, INTEGER } from 'sequelize'
import { Farm } from './farm.model'

@Table
export class User extends Model {
  @Column({ type: BIGINT, unique: true, allowNull: false })
  telegramId: bigint

  @ForeignKey(() => User)
  @Column({ type: INTEGER, allowNull: true, onUpdate: 'cascade', onDelete: 'set null' })
  referrerId: number

  @Column({ type: BIGINT, allowNull: false, defaultValue: 0 })
  coins: number

  @HasOne(() => Farm)
  Farm: Farm

  @BelongsTo(() => User, 'referrerId')
  Referrer: User

  @HasMany(() => User, 'referrerId')
  Referrals: User[]
}