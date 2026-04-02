import {
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException
} from '@nestjs/common'
import { CoreExceptionFilter } from './core-exception.filter'

describe('CoreExceptionFilter', () => {
  let filter: CoreExceptionFilter
  let mockResponse: any
  let mockHost: any

  beforeEach(() => {
    filter = new CoreExceptionFilter()

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse)
      })
    }
  })

  it('should be defined', () => {
    expect(filter).toBeDefined()
  })

  describe('HttpException handling', () => {
    it('should handle NotFoundException with 404 status', () => {
      const exception = new NotFoundException('Item not found')

      filter.catch(exception, mockHost)

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: 'Item not found'
        })
      )
    })

    it('should handle BadRequestException with 400 status', () => {
      const exception = new BadRequestException('Invalid input')

      filter.catch(exception, mockHost)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'Invalid input'
        })
      )
    })

    it('should handle InternalServerErrorException with 500 status', () => {
      const exception = new InternalServerErrorException('Server error')

      filter.catch(exception, mockHost)

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: 'Server error'
        })
      )
    })

    it('should handle HttpException with string response', () => {
      const exception = new HttpException('Custom error', 422)

      filter.catch(exception, mockHost)

      expect(mockResponse.status).toHaveBeenCalledWith(422)
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 422,
        message: 'Custom error'
      })
    })

    it('should handle HttpException with object response', () => {
      const exception = new HttpException(
        { statusCode: 400, message: 'Bad Request', errors: ['field required'] },
        400
      )

      filter.catch(exception, mockHost)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 400,
        message: 'Bad Request',
        errors: ['field required']
      })
    })
  })

  describe('Non-HttpException handling', () => {
    it('should handle plain Error with 500 status and generic message', () => {
      const exception = new Error('Something broke')

      filter.catch(exception, mockHost)

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR
      )
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error'
      })
    })

    it('should handle non-Error objects with 500 status and generic message', () => {
      const exception = 'string error'

      filter.catch(exception, mockHost)

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR
      )
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error'
      })
    })

    it('should handle null/undefined exceptions', () => {
      filter.catch(null, mockHost)

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR
      )
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error'
      })
    })
  })
})
