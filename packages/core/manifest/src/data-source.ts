import { NestFactory } from '@nestjs/core'
import { DataSource } from 'typeorm'
import { AppModule } from './app.module'

/**
 * Entities are dynamically generated from manifest.yml, so we must boot
 * a full NestJS app context to get an initialized DataSource for the TypeORM CLI.
 *
 * Usage:
 *   npx typeorm migration:generate -d dist/manifest/src/data-source.js migrations/MyMigration
 */

process.env.DB_SYNCHRONIZE = 'false'
process.env.MIGRATIONS_RUN = 'false'

const dataSource: Promise<DataSource> = (async () => {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error']
  })

  const ds = app.get(DataSource)

  process.on('beforeExit', async () => {
    await app.close()
  })

  return ds
})()

export default dataSource
