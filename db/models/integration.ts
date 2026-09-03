import { DataTypes, Model, type Optional, type Sequelize } from 'sequelize'

export type IntegrationAttributes = {
  id: number
  name: string
  endpointUrl: string
  apiKeyRef: string
}

type IntegrationCreation = Optional<IntegrationAttributes, 'id'>

export class Integration
  extends Model<IntegrationAttributes, IntegrationCreation>
  implements IntegrationAttributes
{
  declare id: number
  declare name: string
  declare endpointUrl: string
  declare apiKeyRef: string
}

export function initIntegration(sequelize: Sequelize): typeof Integration {
  Integration.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      endpointUrl: { type: DataTypes.STRING, allowNull: false },
      apiKeyRef: { type: DataTypes.STRING, allowNull: false },
    },
    { sequelize, tableName: 'Integrations', timestamps: false },
  )
  return Integration
}

