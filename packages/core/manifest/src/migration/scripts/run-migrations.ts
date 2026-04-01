import { withMigrationContext } from './bootstrap-migration-context'

withMigrationContext(async (dataSource, logger) => {
  const migrations = await dataSource.runMigrations()

  if (migrations.length === 0) {
    logger.log('No pending migrations. Database is up to date.')
  } else {
    logger.log(`Executed ${migrations.length} migration(s):`)
    migrations.forEach((m) => logger.log(`  - ${m.name}`))
  }
})
