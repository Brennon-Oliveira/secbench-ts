import { DataTypes, Model, type Optional, type Sequelize } from 'sequelize'

export type InvoiceAttributes = {
  id: number
  orderId: number
  fileName: string
  issuedAt: Date
}

type InvoiceCreation = Optional<InvoiceAttributes, 'id' | 'issuedAt'>

export class Invoice extends Model<InvoiceAttributes, InvoiceCreation> implements InvoiceAttributes {
  declare id: number
  declare orderId: number
  declare fileName: string
  declare issuedAt: Date
}

export function initInvoice(sequelize: Sequelize): typeof Invoice {
  Invoice.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      orderId: { type: DataTypes.INTEGER, allowNull: false },
      fileName: { type: DataTypes.STRING, allowNull: false },
      issuedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { sequelize, tableName: 'Invoices', updatedAt: false, createdAt: false },
  )
  return Invoice
}

