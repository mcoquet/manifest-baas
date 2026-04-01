import { ConfigService } from '@nestjs/config'
import * as fs from 'fs'
import * as path from 'path'
import { withMigrationContext } from './bootstrap-migration-context'

withMigrationContext(async (dataSource, logger, appContext) => {
  const configService = appContext.get(ConfigService)
  const migrationsDir: string = configService.get('paths').migrationsDir

  const sqlInMemory = await dataSource.driver.createSchemaBuilder().log()

  if (sqlInMemory.upQueries.length === 0) {
    logger.log(
      'No schema changes detected. Database is up to date with your manifest.'
    )
    return
  }

  fs.mkdirSync(migrationsDir, { recursive: true })

  const timestamp = Date.now()
  const migrationName = `Migration${timestamp}`

  const upStatements = sqlInMemory.upQueries
    .map((q) => {
      const params = q.parameters?.length
        ? `, ${JSON.stringify(q.parameters)}`
        : ''
      return `        await queryRunner.query(\`${escapeTemplate(q.query)}\`${params});`
    })
    .join('\n')

  const downStatements = [...sqlInMemory.downQueries]
    .reverse()
    .map((q) => {
      const params = q.parameters?.length
        ? `, ${JSON.stringify(q.parameters)}`
        : ''
      return `        await queryRunner.query(\`${escapeTemplate(q.query)}\`${params});`
    })
    .join('\n')

  const migrationContent = `import { MigrationInterface, QueryRunner } from 'typeorm'

export class ${migrationName} implements MigrationInterface {
    name = '${migrationName}'

    public async up(queryRunner: QueryRunner): Promise<void> {
${upStatements}
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
${downStatements}
    }
}
`

  const fileName = `${timestamp}-migration.ts`
  const filePath = path.join(migrationsDir, fileName)
  fs.writeFileSync(filePath, migrationContent)

  logger.log(`Migration generated: migrations/${fileName}`)
  logger.log('Review the migration file, then commit it to your repository.')
  logger.log(
    'Migrations will run automatically on production startup, or run manually with: npm run migration:run'
  )
})

/**
 * Escapes backticks and `${` sequences so SQL strings can be safely
 * embedded inside TypeScript template literals.
 */
function escapeTemplate(str: string): string {
  return str.replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
}
