import { Column, Table, Model, HasOne, ForeignKey, HasMany, BelongsTo, BelongsToMany, AfterUpdate, DataType } from 'sequelize-typescript'
import { BIGINT, FLOAT, INTEGER } from 'sequelize'
import { Farm } from './farm.model'
import { Bonus } from './bonus.model'
import { Task } from './task.model'
import { UserTask } from './userTask.model'
import { Revenues } from './revenues.model'
import { HookReturn } from 'sequelize/types/hooks'
import { EnumRoles } from 'src/enums/roles.enum'

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

  @Column({ type: DataType.ENUM("admin", "user"), allowNull: false, defaultValue: "user" })
  role: EnumRoles

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
  static async afterUpdateModel(instance: User): Promise<HookReturn> {
    if (instance.changed("coins")) {

      const previous = instance.previous("coins")
      const currentCoins = instance.coins

      if (instance.referrerId) {

        const ref_user = await User.findOne({
            where: {
                id: instance.referrerId
            }
        })

        const revenues = await ref_user.$get("Revenues")

        revenues.coins += (currentCoins - previous) * 0.01

        await revenues.save()
      }
    }

    return Promise.resolve()
  }
}