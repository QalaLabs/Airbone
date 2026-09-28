// Runs a Next.js app for E2E from an isolated copy of its sources.
//
// - `.env*` files are never copied, so production credentials/URLs in the
//   developer's env files cannot leak into the test run; only the explicit
//   environment passed by the caller is used.
// - A separate copy keeps `.next` apart from any dev server using the repo.
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, symlinkSync } from 'node:fs'
import { join } from 'node:path'

const EXCLUDED_DIRS = ['node_modules', '.next', '.git', 'test-results', 'playwright-report', 'e2e', 'admin', '.vercel', '.turbo']

function copyTree(src, dest) {
  mkdirSync(dest, { recursive: true })
  if (process.platform === 'win32') {
    const r = spawnSync('robocopy', [src, dest, '/MIR', '/NFL', '/NDL', '/NJH', '/NJS', '/NP', '/XD', ...EXCLUDED_DIRS, '/XF', '.env*'], { stdio: 'inherit' })
    if (r.status === null || r.status >= 8) throw new Error(`robocopy failed (${r.status})`)
  } else {
    const r = spawnSync('rsync', ['-a', '--delete', ...EXCLUDED_DIRS.map((d) => `--exclude=${d}`), '--exclude=.env*', `${src}/`, `${dest}/`], { stdio: 'inherit' })
    if (r.status !== 0) throw new Error('rsync failed')
  }
}

function linkNodeModules(src, dest) {
  const target = join(dest, 'node_modules')
  if (existsSync(target)) return
  symlinkSync(join(src, 'node_modules'), target, process.platform === 'win32' ? 'junction' : 'dir')
}

function run(cmd, args, opts) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', ...opts })
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')} exited ${r.status}`)
}

/**
 * @param {object} o
 * @param {string} o.source   app root to copy
 * @param {string} o.workdir  isolated copy location
 * @param {number} o.port
 * @param {Record<string,string>} o.env  full test environment for build + start
 * @param {() => void} [o.beforeBuild]
 */
export function startIsolatedApp({ source, workdir, port, env, beforeBuild }) {
  if (process.env.E2E_FRESH === '1' && existsSync(workdir)) rmSync(workdir, { recursive: true, force: true })
  copyTree(source, workdir)
  linkNodeModules(source, workdir)

  const childEnv = { ...env, NEXT_TELEMETRY_DISABLED: '1' }
  beforeBuild?.(childEnv)
  if (process.env.E2E_SKIP_BUILD !== '1' || !existsSync(join(workdir, '.next', 'BUILD_ID'))) {
    run('npx', ['next', 'build'], { cwd: workdir, env: childEnv })
  }
  const child = spawn('npx', ['next', 'start', '-p', String(port), '-H', '127.0.0.1'], {
    cwd: workdir,
    env: { ...childEnv, NODE_ENV: 'production' },
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  const stop = () => child.kill()
  process.on('SIGINT', stop)
  process.on('SIGTERM', stop)
  process.on('exit', stop)
  child.on('exit', (code) => process.exit(code ?? 0))
}

/** Minimal env: only OS basics from the parent, nothing from app env files. */
export function baseEnv() {
  const keep = ['PATH', 'Path', 'PATHEXT', 'SystemRoot', 'SYSTEMROOT', 'ComSpec', 'TEMP', 'TMP', 'HOME', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA', 'ProgramFiles', 'ProgramFiles(x86)', 'NUMBER_OF_PROCESSORS', 'PROCESSOR_ARCHITECTURE', 'OS', 'windir']
  const env = {}
  for (const k of keep) if (process.env[k] !== undefined) env[k] = process.env[k]
  return env
}
