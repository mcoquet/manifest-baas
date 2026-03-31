import {
  CallHandler,
  ExecutionContext,
  NestInterceptor
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { CrudEventName, EntityManifest } from '@repo/types'
import { EntityManifestService } from '../manifest/services/entity-manifest.service'
import { CollectionController } from './controllers/collection.controller'
import { SingleController } from './controllers/single.controller'
import { EventService } from '../event/event.service'

export interface CrudEventContext {
  entityManifest: EntityManifest | undefined
  beforeRequestEvent: CrudEventName
  afterRequestEvent: CrudEventName
}

export abstract class BaseCrudInterceptor implements NestInterceptor {
  constructor(
    protected readonly eventService: EventService,
    protected readonly entityManifestService: EntityManifestService
  ) {}

  protected resolveEventContext(context: ExecutionContext): CrudEventContext {
    const handlerName = context.getHandler().name as
      | keyof CollectionController
      | keyof SingleController

    const beforeRequestEvent: CrudEventName =
      this.eventService.getRelatedCrudEvent(handlerName, 'before')

    const afterRequestEvent: CrudEventName =
      this.eventService.getRelatedCrudEvent(handlerName, 'after')

    let entityManifest: EntityManifest | undefined
    if (beforeRequestEvent || afterRequestEvent) {
      entityManifest = this.entityManifestService.getEntityManifest({
        slug: context.getArgs()[0].params.entity
      })
    }

    return { entityManifest, beforeRequestEvent, afterRequestEvent }
  }

  abstract intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<unknown>>
}
