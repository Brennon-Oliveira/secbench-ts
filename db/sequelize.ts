import { Sequelize } from 'sequelize'
import { loadEnv } from '../config/env.js'

let sequelize: Sequelize | null = null

export function getSequelize(sqlitePath?: string): Sequelize {
  if (sequelize) return sequelize
  const env = loadEnv()
  const storage = sqlitePath ?? env.sqlitePath
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    logging: false,
  })
  return sequelize
}

export function resetSequelize(): void {
  sequelize = null
}

export { sequelize }

