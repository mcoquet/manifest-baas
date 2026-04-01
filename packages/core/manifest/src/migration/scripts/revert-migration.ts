import { withMigrationContext } from './bootstrap-migration-context'

withMigrationContext(async (dataSource, logger) => {
  await dataSource.undoLastMigration()
  logger.log('Last migration has been reverted.')
})
