import { Logger } from '@nestjs/common'
import { z } from 'zod'

const validationLogger = new Logger('EnvValidation')

// Treats empty string the same as undefined — z.string() alone allows ''.
const requiredString = (message: string) =>
  z.string({ message }).min(1, message)

const baseSchema = z.object({
  NODE_ENV: z
    .enum(['production', 'development', 'test', 'contribution'])
    .default('development'),
  PORT: z.string().optional(),
  BASE_URL: z.string().optional(),
  OPEN_API_DOCS: z.string().optional(),
  TOKEN_SECRET_KEY: z.string().optional(),
  ALLOWED_ORIGINS: z.string().optional(),

  // Database
  DB_CONNECTION: z.enum(['sqlite', 'postgres', 'mysql']).optional(),
  DB_PATH: z.string().optional(),
  DB_HOST: z.string().optional(),
  DB_PORT: z.string().optional(),
  DB_USERNAME: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_DATABASE: z.string().optional(),
  DB_SSL: z.string().optional(),
  DB_SSL_REJECT_UNAUTHORIZED: z.string().optional(),
  DB_DROP_SCHEMA: z.string().optional(),
  DB_SYNCHRONIZE: z.string().optional(),
  MIGRATIONS_RUN: z.string().optional(),

  // S3
  S3_BUCKET: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_FOLDER_PREFIX: z.string().optional(),

  // Paths
  MANIFEST_FILE_PATH: z.string().optional(),
  PUBLIC_FOLDER: z.string().optional(),
  MANIFEST_HANDLERS_FOLDER: z.string().optional(),
  MIGRATIONS_DIR: z.string().optional(),

  // Admin / Seeding
  ADMIN_EMAIL: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  MANIFEST_SEED: z.string().optional()
})

type EnvConfig = z.infer<typeof baseSchema>

const productionSchema = baseSchema.extend({
  TOKEN_SECRET_KEY: requiredString(
    'TOKEN_SECRET_KEY is required in production. Set a custom secret in your env file.'
  ),
  BASE_URL: requiredString(
    'BASE_URL is required in production. The default localhost URL is not suitable for production.'
  )
})

function requireField(
  data: EnvConfig,
  ctx: z.RefinementCtx,
  field: keyof EnvConfig,
  message: string
): void {
  if (!data[field]) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message })
  }
}

// Applied in all environments: missing credentials cause runtime failures, not just prod.
function validateDatabaseConfig(data: EnvConfig, ctx: z.RefinementCtx): void {
  const db = data.DB_CONNECTION
  if (db !== 'postgres' && db !== 'mysql') return

  requireField(data, ctx, 'DB_HOST', `DB_HOST is required when using ${db}.`)
  requireField(
    data,
    ctx,
    'DB_USERNAME',
    `DB_USERNAME is required when using ${db}.`
  )
  requireField(
    data,
    ctx,
    'DB_PASSWORD',
    `DB_PASSWORD is required when using ${db}.`
  )
  requireField(
    data,
    ctx,
    'DB_DATABASE',
    `DB_DATABASE is required when using ${db}.`
  )
}

// Applied in all environments: misconfigured S3 fails at runtime, not just prod.
function validateS3Config(data: EnvConfig, ctx: z.RefinementCtx): void {
  if (!data.S3_BUCKET) return

  requireField(
    data,
    ctx,
    'S3_ACCESS_KEY_ID',
    'S3_ACCESS_KEY_ID is required when S3_BUCKET is set.'
  )
  requireField(
    data,
    ctx,
    'S3_SECRET_ACCESS_KEY',
    'S3_SECRET_ACCESS_KEY is required when S3_BUCKET is set.'
  )
  requireField(
    data,
    ctx,
    'S3_REGION',
    'S3_REGION is required when S3_BUCKET is set.'
  )
}

function emitDevWarnings(data: EnvConfig): void {
  if (!data.TOKEN_SECRET_KEY) {
    validationLogger.warn(
      'TOKEN_SECRET_KEY is not set. A random key will be generated — tokens will not persist across restarts.'
    )
  }
  if (!data.BASE_URL) {
    validationLogger.warn(
      'BASE_URL is not set. Defaulting to http://localhost.'
    )
  }
}

function formatErrors(error: z.ZodError): string {
  const lines = error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'config'
    return `  - ${path}: ${issue.message}`
  })
  return (
    `Environment validation failed. The following variables are missing or invalid:\n` +
    lines.join('\n') +
    `\n\nSet these variables in your .env file or environment.`
  )
}

export function validateEnvironment(
  config: Record<string, unknown>
): Record<string, unknown> {
  const isProduction = config['NODE_ENV'] === 'production'

  const baseForEnv = isProduction ? productionSchema : baseSchema
  const schema = baseForEnv.superRefine((data, ctx) => {
    validateDatabaseConfig(data, ctx)
    validateS3Config(data, ctx)
  })

  const result = schema.safeParse(config)

  if (!result.success) {
    throw new Error(formatErrors(result.error))
  }

  if (!isProduction) {
    emitDevWarnings(result.data)
  }

  return config
}
