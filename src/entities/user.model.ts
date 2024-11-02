import { Column, Table, Model, HasOne, ForeignKey, HasMany, BelongsTo, BelongsToMany, AfterUpdate, DataType } from 'sequelize-typescript'
import { BIGINT, FLOAT, INTEGER, NUMBER, STRING } from 'sequelize'
import { Farm } from './farm.model'
import { Bonus } from './bonus.model'
import { Task } from './task.model'
import { UserTask } from './userTask.model'
import { Revenues } from './revenues.model'
import { HookReturn } from 'sequelize/types/hooks'
import { EnumRoles } from 'src/enums/roles.enum'
import { EnumLanguages } from 'src/enums/languages.enum'

export interface ICreateUser {
	telegramId: bigint,
	referrerId?: number,
	color: string,
	username: string
}

@Table
export class User extends Model<User, ICreateUser> {
	@Column({ type: BIGINT, unique: true, allowNull: false })
	telegramId: bigint

	@Column({ type: STRING, allowNull: false, defaultValue: "#000" })
	color: string

	@Column({ type: DataType.ENUM("en", "ru"), allowNull: false, defaultValue: "ru"  })
	user_lng: EnumLanguages

	@Column({ type: STRING, allowNull: false })
	username: string

	@ForeignKey(() => User)
	@Column({ type: INTEGER, allowNull: true, onUpdate: 'cascade', onDelete: 'set null' })
	referrerId: number

	@Column({ type: INTEGER, allowNull: false, defaultValue: 0 })
	referals_count: number

	@Column({ type: FLOAT, allowNull: false, defaultValue: 0 })
	coins: number

	@Column({ type: FLOAT, allowNull: false, defaultValue: 0 })
	farm_user_coins: number

	@Column({ type: DataType.ENUM("admin", "user"), allowNull: false, defaultValue: "user" })
	role: EnumRoles

	@Column({ type: FLOAT, allowNull: false, defaultValue: 0 })
	task_completed: number

	@Column({ type: FLOAT, allowNull: false, defaultValue: 0 })
	task_total_coin: number

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

	@Column({ type: FLOAT, allowNull: false, defaultValue: 0 })
	day_revenues: number

	@BelongsToMany(() => Task, () => UserTask)
	tasks: Task[]

	@AfterUpdate
	static async afterUpdateModel(instance: User): Promise<HookReturn> {
		if (instance.changed("coins") && !instance.changed("day_revenues")) {

			const previous = instance.previous("coins")
			const currentCoins = instance.coins

			if (instance.referrerId) {
				const ref_user = await User.findOne({
					where: {
						id: instance.referrerId
					}
				})

				let refForUser: User
				let revenuesForUser: Revenues

				const revenues = await ref_user.$get("Revenues")

				if (ref_user.referrerId) {
					refForUser = await User.findOne({
						where: {
							id: ref_user.referrerId
						}
					})
	
					revenuesForUser = await refForUser.$get("Revenues")
				}

				if (!(revenues.next_revenues_time.getTime() <= new Date().getTime())) {
					revenues.coins += (currentCoins - previous) * 0.05
					instance.day_revenues += (currentCoins - previous) * 0.05

					if (revenuesForUser) {
						revenuesForUser.coins += (currentCoins - previous) * 0.025
						await revenuesForUser.save()
					}

					await revenues.save()
					await instance.save()
				}
			}
		}

		return Promise.resolve()
	}
}