import { validateEnvironment } from './env.validation'

describe('validateEnvironment', () => {
  describe('production mode', () => {
    const productionBase: Record<string, unknown> = { NODE_ENV: 'production' }

    it('should throw if TOKEN_SECRET_KEY is missing in production', () => {
      expect(() =>
        validateEnvironment({
          ...productionBase,
          BASE_URL: 'https://example.com'
        })
      ).toThrow(/TOKEN_SECRET_KEY/)
    })

    it('should throw if BASE_URL is missing in production', () => {
      expect(() =>
        validateEnvironment({
          ...productionBase,
          TOKEN_SECRET_KEY: 'my-secret'
        })
      ).toThrow(/BASE_URL/)
    })

    it('should list all missing variables in a single error', () => {
      expect(() => validateEnvironment(productionBase)).toThrow(
        /TOKEN_SECRET_KEY[\s\S]*BASE_URL|BASE_URL[\s\S]*TOKEN_SECRET_KEY/
      )
    })

    it('should pass with all required production variables', () => {
      expect(() =>
        validateEnvironment({
          ...productionBase,
          TOKEN_SECRET_KEY: 'my-secret',
          BASE_URL: 'https://example.com'
        })
      ).not.toThrow()
    })

    it('should reject empty string TOKEN_SECRET_KEY in production', () => {
      expect(() =>
        validateEnvironment({
          ...productionBase,
          TOKEN_SECRET_KEY: '',
          BASE_URL: 'https://example.com'
        })
      ).toThrow(/TOKEN_SECRET_KEY/)
    })

    describe('database validation', () => {
      const prodWithBase: Record<string, unknown> = {
        ...productionBase,
        TOKEN_SECRET_KEY: 'my-secret',
        BASE_URL: 'https://example.com'
      }

      it('should not require DB credentials for sqlite (default)', () => {
        expect(() => validateEnvironment(prodWithBase)).not.toThrow()
      })

      it('should require DB credentials for postgres', () => {
        expect(() =>
          validateEnvironment({
            ...prodWithBase,
            DB_CONNECTION: 'postgres'
          })
        ).toThrow(/DB_HOST.*DB_USERNAME.*DB_PASSWORD.*DB_DATABASE/s)
      })

      it('should require DB credentials for mysql', () => {
        expect(() =>
          validateEnvironment({
            ...prodWithBase,
            DB_CONNECTION: 'mysql'
          })
        ).toThrow(/DB_USERNAME/)
      })

      it('should pass when all postgres credentials are provided', () => {
        expect(() =>
          validateEnvironment({
            ...prodWithBase,
            DB_CONNECTION: 'postgres',
            DB_HOST: 'db.example.com',
            DB_USERNAME: 'user',
            DB_PASSWORD: 'pass',
            DB_DATABASE: 'mydb'
          })
        ).not.toThrow()
      })

      it('should pass when all mysql credentials are provided', () => {
        expect(() =>
          validateEnvironment({
            ...prodWithBase,
            DB_CONNECTION: 'mysql',
            DB_HOST: 'db.example.com',
            DB_USERNAME: 'user',
            DB_PASSWORD: 'pass',
            DB_DATABASE: 'mydb'
          })
        ).not.toThrow()
      })
    })

    describe('S3 validation', () => {
      const prodWithBase: Record<string, unknown> = {
        ...productionBase,
        TOKEN_SECRET_KEY: 'my-secret',
        BASE_URL: 'https://example.com'
      }

      it('should not require S3 config when S3_BUCKET is not set', () => {
        expect(() => validateEnvironment(prodWithBase)).not.toThrow()
      })

      it('should require S3 credentials when S3_BUCKET is set', () => {
        expect(() =>
          validateEnvironment({
            ...prodWithBase,
            S3_BUCKET: 'my-bucket'
          })
        ).toThrow(/S3_ACCESS_KEY_ID.*S3_SECRET_ACCESS_KEY.*S3_REGION/s)
      })

      it('should pass when all S3 credentials are provided', () => {
        expect(() =>
          validateEnvironment({
            ...prodWithBase,
            S3_BUCKET: 'my-bucket',
            S3_ACCESS_KEY_ID: 'key',
            S3_SECRET_ACCESS_KEY: 'secret',
            S3_REGION: 'us-east-1'
          })
        ).not.toThrow()
      })
    })
  })

  describe('development mode', () => {
    it('should not throw for missing variables in development', () => {
      expect(() =>
        validateEnvironment({ NODE_ENV: 'development' })
      ).not.toThrow()
    })

    it('should not throw for missing variables with no NODE_ENV', () => {
      expect(() => validateEnvironment({})).not.toThrow()
    })

    it('should still validate S3 config in development when S3_BUCKET is set', () => {
      expect(() =>
        validateEnvironment({
          NODE_ENV: 'development',
          S3_BUCKET: 'my-bucket'
        })
      ).toThrow(/S3_ACCESS_KEY_ID/)
    })

    it('should pass S3 validation in development when all S3 vars are set', () => {
      expect(() =>
        validateEnvironment({
          NODE_ENV: 'development',
          S3_BUCKET: 'my-bucket',
          S3_ACCESS_KEY_ID: 'key',
          S3_SECRET_ACCESS_KEY: 'secret',
          S3_REGION: 'us-east-1'
        })
      ).not.toThrow()
    })

    it('should require DB credentials for postgres in development', () => {
      expect(() =>
        validateEnvironment({
          NODE_ENV: 'development',
          DB_CONNECTION: 'postgres'
        })
      ).toThrow(/DB_HOST/)
    })

    it('should pass DB validation in development when all DB vars are set', () => {
      expect(() =>
        validateEnvironment({
          NODE_ENV: 'development',
          DB_CONNECTION: 'postgres',
          DB_HOST: 'localhost',
          DB_USERNAME: 'user',
          DB_PASSWORD: 'pass',
          DB_DATABASE: 'mydb'
        })
      ).not.toThrow()
    })
  })

  describe('return value', () => {
    it('should return the config object unchanged', () => {
      const config: Record<string, unknown> = {
        NODE_ENV: 'development',
        CUSTOM_VAR: 'value'
      }
      expect(validateEnvironment(config)).toBe(config)
    })
  })
})
