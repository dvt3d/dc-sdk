/**
 @author : Caven Chen
 **/

'use strict'

import fse from 'fs-extra'
import path from 'path'
import { pipeline } from 'node:stream/promises'
import gulp from 'gulp'
import esbuild from 'esbuild'
import concat from 'gulp-concat'
import startServer from './server.js'
import inlineImage from 'esbuild-plugin-inline-image'
import { sassPlugin } from 'esbuild-sass-plugin'
import { glsl } from 'esbuild-plugin-glsl'
import GlobalsPlugin from 'esbuild-plugin-globals'
import shell from 'shelljs'
import chalk from 'chalk'

const cesium_path = path.resolve('./node_modules/cesium/Build/Cesium')

const packageJson = fse.readJsonSync('./package.json')

const buildConfig = {
  entryPoints: ['src/DC.js'],
  bundle: true,
  color: true,
  legalComments: `inline`,
  logLimit: 0,
  target: `es2019`,
  minify: false,
  sourcemap: false,
  write: true,
  logLevel: 'info',
  plugins: [
    inlineImage({
      limit: -1,
    }),
    glsl(),
    sassPlugin(),
  ],
  external: ['cesium'],
}

function getTime() {
  let now = new Date()
  let m = now.getMonth() + 1
  m = m < 10 ? '0' + m : m
  let d = now.getDate()
  d = d < 10 ? '0' + d : d
  return `${now.getFullYear()}-${m}-${d}`
}

/**
 *
 * @param options
 * @returns {Promise<void>}
 */
async function buildCSS(options) {
  await esbuild.build({
    ...buildConfig,
    minify: options.minify,
    entryPoints: ['src/themes/index.scss'],
    outfile: path.join('dist', 'dc.min.css'),
  })
}

/**
 * Build SDK Worker entries and copy their companion resources.
 * @param options
 * @returns {Promise<void>}
 */
async function buildWorkers(options) {
  const source = path.join('src', 'workers')
  const destination = path.join('dist', 'resources', 'Workers', 'DC')
  if (!(await fse.pathExists(source))) {
    await fse.emptyDir(destination)
    return
  }
  // Compile before replacing the last usable output, especially during watch.
  const result = await esbuild.build({
    ...buildConfig,
    entryPoints: ['src/workers/**/*.js'],
    outbase: source,
    outdir: destination,
    format: 'esm',
    external: [],
    minify: options.minify,
    write: false,
  })
  // Only clear SDK-owned output; Cesium's Workers remain in the parent directory.
  await fse.emptyDir(destination)
  for (const file of result.outputFiles) {
    await fse.outputFile(file.path, file.contents)
  }
  await pipeline(
    gulp.src(['src/workers/**/*', '!src/workers/**/*.js'], {
      base: source,
      nodir: true,
      allowEmpty: true,
    }),
    gulp.dest(destination)
  )
}

/**
 *
 * @param options
 * @returns {Promise<void>}
 */
async function buildModules(options) {
  const dcPath = path.join('src', 'DC.js')

  const content = await fse.readFile(path.join('src', 'index.js'), 'utf8')

  const exportVersion = `export const VERSION = '${packageJson.version}'`

  const cmdOut_content = await fse.readFile(
    path.join('src', 'copyright', 'cmdOut.js'),
    'utf8'
  )

  const cmdOutFunction = `
       globalThis.__cmdOut = () => {
          ${cmdOut_content
            .replace('{{__VERSION__}}', packageJson.version)
            .replace('{{__TIME__}}', getTime())
            .replace(
              '{{__CESIUM_VERSION__}}',
              packageJson.dependencies['cesium'].replace('^', '')
            )
            .replace('{{__AUTHOR__}}', packageJson.author)
            .replace('{{__HOME_PAGE__}}', packageJson.homepage)
            .replace('{{__REPOSITORY__}}', packageJson.repository)}
    }`

  try {
    await fse.outputFile(
      dcPath,
      `
              ${cmdOutFunction}
              ${content}
              ${exportVersion}

            `,
      {
        encoding: 'utf8',
      }
    )
    // Build IIFE
    if (options.iife) {
      await esbuild.build({
        ...buildConfig,
        format: 'iife',
        globalName: 'DC',
        plugins: [
          ...buildConfig.plugins,
          GlobalsPlugin({
            cesium: 'globalThis.Cesium || Cesium',
          }),
        ],
        minify: options.minify,
        outfile: path.join('dist', 'modules-iife.js'),
      })
    }

    // Build Node、
    if (options.node) {
      await esbuild.build({
        ...buildConfig,
        format: 'esm',
        platform: 'node',
        define: {
          TransformStream: 'null',
        },
        minify: options.minify,
        outfile: path.join('dist', 'index.js'),
      })
    }
  } finally {
    await fse.remove(dcPath)
  }
}

/**
 *
 * @param options
 * @returns {Promise<void>}
 */
async function addCopyright(options) {
  let header = await fse.readFile(
    path.join('src', 'copyright', 'header.js'),
    'utf8'
  )
  header = header
    .replace('{{__VERSION__}}', packageJson.version)
    .replace('{{__AUTHOR__}}', packageJson.author)
    .replace('{{__REPOSITORY__}}', packageJson.repository)

  if (options.iife) {
    let filePath = path.join('dist', 'dc.min.js')
    const content = await fse.readFile(filePath, 'utf8')
    await fse.outputFile(filePath, `${header}${content}`, { encoding: 'utf8' })
  }

  if (options.node) {
    let filePath = path.join('dist', 'index.js')
    const content = await fse.readFile(filePath, 'utf8')
    await fse.outputFile(filePath, `${header}${content}`, { encoding: 'utf8' })
  }
}

async function combineJs(options) {
  // combine for iife
  if (options.iife) {
    await fse.ensureFile(path.join(cesium_path, 'Cesium.js'))
    await pipeline(
      gulp.src([
        path.join(cesium_path, 'Cesium.js'),
        path.join('dist', 'modules-iife.js'),
      ]),
      concat('dc.min.js'),
      gulp.dest('dist')
    )
  }

  // The ESM output is already in place; only its copyright remains to be added.
  await addCopyright(options)
  if (options.iife) {
    await fse.remove(path.join('dist', 'modules-iife.js'))
  }
}

async function copyAssets() {
  await fse.emptyDir(path.join('dist', 'resources'))
  for (const dir of ['Assets', 'ThirdParty', 'Workers']) {
    await pipeline(
      gulp.src(path.join(cesium_path, dir, '**'), { nodir: true }),
      gulp.dest(path.join('dist', 'resources', dir))
    )
  }
}

async function regenerate(option) {
  await buildModules(option)
  await combineJs(option)
  await buildCSS(option)
  await buildWorkers(option)
}

export const server = gulp.series(startServer)

export const workers = gulp.series(() => buildWorkers({ minify: true }))

export const dev = gulp.series(
  () => copyAssets(),
  () => {
    shell.echo(chalk.yellow('============= start dev =============='))
    const watcher = gulp.watch(
      ['src/**/*', '!src/DC.js'],
      {
        persistent: true,
        awaitWriteFinish: {
          stabilityThreshold: 1000,
          pollInterval: 100,
        },
      },
      async () => {
        let now = new Date().getTime()
        try {
          await regenerate({ iife: true, minify: false })
          shell.echo(
            chalk.green(`regenerate lib takes ${new Date().getTime() - now} ms`)
          )
        } catch (e) {
          shell.error(e)
        }
      }
    )
    watcher.on('ready', async () => {
      await regenerate({ iife: true, minify: false })
      await startServer()
    })
    return watcher
  }
)

export const buildIIFE = gulp.series(
  () => buildModules({ iife: true, minify: true }),
  () => combineJs({ iife: true }),
  () => buildCSS({ minify: true }),
  copyAssets,
  workers
)

export const buildNode = gulp.series(
  () => buildModules({ node: true, minify: true }),
  () => combineJs({ node: true }),
  () => buildCSS({ minify: true }),
  copyAssets,
  workers
)

export const build = gulp.series(
  () => buildModules({ iife: true, minify: true }),
  () => combineJs({ iife: true }),
  () => buildModules({ node: true, minify: true }),
  () => combineJs({ node: true }),
  () => buildCSS({ minify: true }),
  copyAssets,
  workers
)

export const buildRelease = gulp.series(
  () => buildModules({ iife: true, minify: true }),
  () => combineJs({ iife: true }),
  () => buildModules({ node: true, minify: true }),
  () => combineJs({ node: true }),
  () => buildCSS({ minify: true }),
  copyAssets,
  workers
)
