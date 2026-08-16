import { DataTypes, Model, type Optional, type Sequelize } from 'sequelize'

export type OrderAttributes = {
  id: number
  userId: number
  status: string
  total: number
  trackingCode: string | null
  note: string | null
  createdAt: Date
}

type OrderCreation = Optional<OrderAttributes, 'id' | 'trackingCode' | 'note' | 'createdAt'>

export class Order extends Model<OrderAttributes, OrderCreation> implements OrderAttributes {
  declare id: number
  declare userId: number
  declare status: string
  declare total: number
  declare trackingCode: string | null
  declare note: string | null
  declare createdAt: Date
}

export function initOrder(sequelize: Sequelize): typeof Order {
  Order.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      status: { type: DataTypes.STRING, allowNull: false },
      total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      trackingCode: { type: DataTypes.STRING, allowNull: true },
      note: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { sequelize, tableName: 'Orders', updatedAt: false },
  )
  return Order
}
