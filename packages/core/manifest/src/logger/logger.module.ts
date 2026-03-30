import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { LoggerService } from './logger.service'
import { CorrelationIdMiddleware } from './correlation-id.middleware'
import { CorrelationIdService } from './correlation-id.service'

@Global()
@Module({
  providers: [LoggerService, CorrelationIdService],
  exports: [LoggerService, CorrelationIdService]
})
export class LoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*')
  }
}
