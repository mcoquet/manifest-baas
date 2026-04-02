import { INestApplicationContext } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DataSource } from 'typeorm'
import { AppModule } from '../../app.module'
import { AppLoggerService, getLogLevels } from '../../logger/app-logger.service'

process.env.DB_SYNCHRONIZE = 'false'
process.env.MIGRATIONS_RUN = 'false'

export async function withMigrationContext(
  fn: (
    dataSource: DataSource,
    logger: AppLoggerService,
    appContext: INestApplicationContext
  ) => Promise<void>
): Promise<void> {
  const logger = new AppLoggerService('Migration', {
    logLevels: getLogLevels()
  })

  let appContext: INestApplicationContext

  try {
    appContext = await NestFactory.createApplicationContext(AppModule, {
      logger
    })

    const dataSource = appContext.get(DataSource)
    await fn(dataSource, logger, appContext)
  } catch (error) {
    logger.error('Migration script failed!')
    throw error
  } finally {
    if (appContext) {
      await appContext.close()
    }
  }
}
