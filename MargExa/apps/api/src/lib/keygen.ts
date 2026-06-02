import { randomBytes } from 'node:crypto'

export function generateApiKey(): string {
  return 'mrg_' + randomBytes(24).toString('base64url')
}
