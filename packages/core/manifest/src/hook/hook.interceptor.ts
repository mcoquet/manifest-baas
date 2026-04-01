import { CallHandler, ExecutionContext, Injectable } from '@nestjs/common'
import { Observable, forkJoin, lastValueFrom, tap } from 'rxjs'
import { HookManifest } from '@repo/types'
import { EntityManifestService } from '../manifest/services/entity-manifest.service'
import { HookService } from './hook.service'
import { EventService } from '../event/event.service'
import { BaseCrudInterceptor } from '../crud/base-crud.interceptor'

@Injectable()
export class HookInterceptor extends BaseCrudInterceptor {
  constructor(
    protected readonly eventService: EventService,
    protected readonly entityManifestService: EntityManifestService,
    private readonly hookService: HookService
  ) {
    super(eventService, entityManifestService)
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<unknown>> {
    const { entityManifest, beforeRequestEvent, afterRequestEvent } =
      this.resolveEventContext(context)

    if (beforeRequestEvent) {
      if (entityManifest.hooks?.[beforeRequestEvent]?.length) {
        const request = context.switchToHttp().getRequest()
        const entitySlug: string = request.params.entity
        const id: string = request.params.id
        let payload: object = request.body

        // On "delete" event, there is no payload so we get the id from the request to pass it to the hook.
        if (!payload && id) {
          payload = { id }
        }

        await lastValueFrom(
          forkJoin(
            (entityManifest.hooks?.[beforeRequestEvent] || []).map(
              (hook: HookManifest) =>
                this.hookService.triggerWebhook(hook, entitySlug, payload)
            )
          )
        )
      }
    }

    return next.handle().pipe(
      tap(async (data) => {
        if (afterRequestEvent) {
          if (entityManifest.hooks?.[afterRequestEvent]?.length) {
            const request = context.switchToHttp().getRequest()
            const entitySlug: string = request.params.entity

            await lastValueFrom(
              forkJoin(
                (entityManifest.hooks?.[afterRequestEvent] || []).map(
                  (hook: HookManifest) =>
                    this.hookService.triggerWebhook(hook, entitySlug, data)
                )
              )
            )
          }
        }
      })
    )
  }
}
