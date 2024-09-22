import { INTEGER, DATE } from "sequelize";
import { Column, ForeignKey, Table, BelongsTo, Model } from "sequelize-typescript";
import { User } from "./user.model";

interface ICreateBonus {
    userId: number,
    next_bonus_time: Date
}

@Table
export class Bonus extends Model<Bonus, ICreateBonus> {
    @ForeignKey(() => User)
    @Column({ type: INTEGER, allowNull: false, onDelete: 'cascade', onUpdate: 'cascade' })
    userId: number

    @Column({ type: INTEGER, allowNull: false, defaultValue: 0 })
    currentDay: number

    @Column({ allowNull: false, defaultValue: new Date(), type: DATE })
    next_welcome_date: Date

    @BelongsTo(() => User)
    User: User

    @Column({ allowNull: false, type: DATE })
    next_bonus_time: Date
}