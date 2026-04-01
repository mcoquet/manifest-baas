import { PropType } from '@repo/types'
import { ColumnType } from 'typeorm'

// Base mapping shared across all databases.
const basePropTypeColumnTypes: Record<PropType, ColumnType> = {
  [PropType.String]: 'varchar',
  [PropType.Number]: 'decimal',
  [PropType.Link]: 'varchar',
  [PropType.Text]: 'text',
  [PropType.RichText]: 'text',
  [PropType.Money]: 'decimal',
  [PropType.Date]: 'date',
  [PropType.Timestamp]: 'datetime',
  [PropType.Email]: 'varchar',
  [PropType.Boolean]: 'boolean',
  [PropType.Password]: 'varchar',
  [PropType.Choice]: 'varchar',
  [PropType.Location]: 'json',
  [PropType.File]: 'varchar',
  [PropType.Image]: 'json',
  [PropType.Nested]: 'varchar' // Will be overridden afterwards.
}

export const sqlitePropTypeColumnTypes: Record<PropType, ColumnType> = {
  ...basePropTypeColumnTypes,
  [PropType.Choice]: 'simple-enum'
}

export const mysqlPropTypeColumnTypes: Record<PropType, ColumnType> = {
  ...basePropTypeColumnTypes,
  [PropType.Boolean]: 'tinyint'
}

export const postgresPropTypeColumnTypes: Record<PropType, ColumnType> = {
  ...basePropTypeColumnTypes,
  [PropType.Number]: 'numeric',
  [PropType.Money]: 'numeric',
  [PropType.Timestamp]: 'timestamp',
  [PropType.Choice]: 'text',
  [PropType.Location]: 'jsonb',
  [PropType.Image]: 'jsonb'
}
