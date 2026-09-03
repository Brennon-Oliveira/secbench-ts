import { DataTypes, Model, type Optional, type Sequelize } from 'sequelize'

export type UserAttributes = {
  id: number
  email: string
  passwordHash: string
  role: 'customer' | 'admin'
  resetToken: string | null
  createdAt: Date
}

type UserCreation = Optional<UserAttributes, 'id' | 'resetToken' | 'createdAt'>

export class User extends Model<UserAttributes, UserCreation> implements UserAttributes {
  declare id: number
  declare email: string
  declare passwordHash: string
  declare role: 'customer' | 'admin'
  declare resetToken: string | null
  declare createdAt: Date
}

export function initUser(sequelize: Sequelize): typeof User {
  User.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      passwordHash: { type: DataTypes.STRING, allowNull: false },
      role: { type: DataTypes.STRING, allowNull: false },
      resetToken: { type: DataTypes.STRING, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { sequelize, tableName: 'Users', updatedAt: false },
  )
  return User
}

