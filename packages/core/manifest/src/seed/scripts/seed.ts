import { INestApplicationContext } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../../app.module'
import { SeederService } from '../services/seeder.service'
import { AppLoggerService, getLogLevels } from '../../logger/app-logger.service'

process.env.MANIFEST_SEED = 'true'

async function bootstrap() {
  const logger = new AppLoggerService('Seed', {
    logLevels: getLogLevels()
  })

  NestFactory.createApplicationContext(AppModule, {
    logger
  })
    .then((appContext: INestApplicationContext) => {
      logger.log('Seeding database...')

      appContext
        .get(SeederService)
        .seed()
        .then(() => {
          logger.log(
            'Seed complete! Please refresh your browser to see your new data.'
          )
        })
        .catch((error) => {
          logger.error('Seeding failed!')
          throw error
        })
        .finally(() => appContext.close())
    })
    .catch((error) => {
      throw error
    })
}
bootstrap()
