import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common'
import { Request, Response } from 'express'
import path from 'path'
import fs from 'fs'
import { ConfigService } from '@nestjs/config'
import { BackendSDK } from '../sdk/backend-sdk'

@Injectable()
export class HandlerService {
  private readonly logger = new Logger(HandlerService.name)

  constructor(
    private configService: ConfigService,
    private readonly sdk: BackendSDK
  ) {}

  /**
   * Trigger the handler function and return the response.
   *
   * @param path Handler path
   * @param req Request object
   * @param res Response object
   *
   * @returns Handler response
   */
  async trigger({
    path,
    req,
    res
  }: {
    path: string
    req: Request
    res: Response
  }): Promise<unknown> {
    const handlerFn = await this.importHandler(path)

    return handlerFn(req, res, this.sdk)
  }

  /**
   * Import handler function to trigger the handler.
   *
   * @param handler Handler path
   */
  async importHandler(handler: string) {
    // Construct the handler file path.
    const handlerPath = path.resolve(
      this.configService.get('paths').handlersFolder,
      `${handler}.js`
    )

    if (!fs.existsSync(handlerPath)) {
      throw new NotFoundException('Handler not found')
    }

    // Import the handler.
    let module: any
    try {
      module = await this.dynamicImport(handlerPath)
    } catch (error) {
      this.logger.error(
        `Failed to import handler at ${handlerPath}: ${error instanceof Error ? error.message : error}`
      )
      throw new InternalServerErrorException('Failed to import handler')
    }

    if (typeof module.default !== 'function') {
      throw new InternalServerErrorException('Handler is invalid')
    }

    return module.default
  }

  /**
   * Dynamically import a module.
   *
   * @param path Module path
   *
   * @returns Imported module
   */
  async dynamicImport(path: string): Promise<any> {
    return import(path)
  }
}
