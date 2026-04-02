import { withMigrationContext } from './bootstrap-migration-context'

withMigrationContext(async (dataSource, logger) => {
  const hasPending = await dataSource.showMigrations()

  if (hasPending) {
    logger.warn(
      'There are pending migrations. Run "npm run migration:run" to apply them.'
    )
  } else {
    logger.log('All migrations are up to date.')
  }
})
