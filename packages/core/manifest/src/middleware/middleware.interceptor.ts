import { CallHandler, ExecutionContext, Injectable } from '@nestjs/common'
import { Observable, tap } from 'rxjs'
import { EventService } from '../event/event.service'
import { EntityManifestService } from '../manifest/services/entity-manifest.service'
import { HandlerService } from '../handler/handler.service'
import { BaseCrudInterceptor } from '../crud/base-crud.interceptor'

@Injectable()
export class MiddlewareInterceptor extends BaseCrudInterceptor {
  constructor(
    protected readonly eventService: EventService,
    protected readonly entityManifestService: EntityManifestService,
    private readonly handlerService: HandlerService
  ) {
    super(eventService, entityManifestService)
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<unknown>> {
    const { entityManifest, beforeRequestEvent, afterRequestEvent } =
      this.resolveEventContext(context)

    const httpContext = context.switchToHttp()
    const req = httpContext.getRequest()
    const res = httpContext.getResponse()

    if (beforeRequestEvent) {
      for (const middleware of entityManifest.middlewares?.[
        beforeRequestEvent
      ] || []) {
        await this.handlerService.trigger({
          path: middleware.handler,
          req,
          res
        })
      }
    }

    return next.handle().pipe(
      tap(async () => {
        if (afterRequestEvent) {
          for (const middleware of entityManifest.middlewares?.[
            afterRequestEvent
          ] || []) {
            await this.handlerService.trigger({
              path: middleware.handler,
              req,
              res
            })
          }
        }
      })
    )
  }
}
