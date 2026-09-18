/**
 * Fails when package.json has a version with no section in change-log.md.
 * Runs in `npm run check` and in the pre-commit hook.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')

const { version } = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
  version: string
}
const changelog = readFileSync(resolve(root, 'change-log.md'), 'utf8')

const heading = new RegExp(`^## \\[${version.replace(/\./g, '\\.')}\\]`, 'm')

if (!heading.test(changelog)) {
  console.error(
    `change-log.md has no section for version ${version}.\n` +
      `Add "## [${version}] - YYYY-MM-DD" at the top, above the previous release.`,
  )
  process.exit(1)
}

console.log(`change-log.md documents version ${version}.`)
