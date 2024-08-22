import { Column, Table, Model, HasOne, ForeignKey, HasMany, BelongsTo, BelongsToMany, AfterUpdate } from 'sequelize-typescript'
import { BIGINT, FLOAT, INTEGER } from 'sequelize'
import { Farm } from './farm.model'
import { Bonus } from './bonus.model'
import { Task } from './task.model'
import { UserTask } from './userTask.model'
import { Revenues } from './revenues.model'
import { UserServiceFactory } from 'src/modules/user/user.factory'

export interface ICreateUser {
  telegramId: bigint,
  referrerId?: number
}

@Table
export class User extends Model<User, ICreateUser> {
  @Column({ type: BIGINT, unique: true, allowNull: false })
  telegramId: bigint

  @ForeignKey(() => User)
  @Column({ type: INTEGER, allowNull: true, onUpdate: 'cascade', onDelete: 'set null' })
  referrerId: number

  @Column({ type: FLOAT, allowNull: false, defaultValue: 0 })
  coins: number

  @HasOne(() => Farm)
  Farm: Farm

  @HasOne(() => Bonus)
  Bonus: Bonus

  @HasOne(() => Revenues)
  Revenues: Revenues

  @BelongsTo(() => User, 'referrerId')
  Referrer: User

  @HasMany(() => User, 'referrerId')
  Referrals: User[]

  @BelongsToMany(() => Task, () => UserTask)
  tasks: Task[]

  @AfterUpdate
  async afterUpdate() {
    if (this.changed("coins")) {
      const userService = UserServiceFactory.getUserService()

      const previous = this.previous("coins")
      const currentCoins = this.coins

      await userService.updateReferalUser(this, currentCoins - previous)
    }
  }
}