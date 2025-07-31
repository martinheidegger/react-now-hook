import { readFile, writeFile, readdir, unlink } from 'node:fs/promises'
import express from 'express'
import 'temporal-polyfill/global'
import '@formatjs/intl-durationformat/polyfill.js'

// Constants
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 5173
const base = process.env.BASE || '/'
const isBuild = process.env.BUILD === "1"

// Create http server
const app = express()

// Add Vite or respective production middlewares
/** @type {import('vite').ViteDevServer | undefined} */
let vite
const { createServer } = await import('vite')
vite = await createServer({
  server: {
    middlewareMode: true,
    hmr: !isBuild
  },
  appType: 'custom',
  base,
})
app.use(vite.middlewares)

// Serve HTML
app.use('*', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '')

    /** @type {string} */
    let template
    /** @type {import('./src/entry-server.js').render} */
    let render
    // Always read fresh template in development
    template = await readFile('./index.html', 'utf-8')
    template = await vite.transformIndexHtml(url, template)
    render = (await vite.ssrLoadModule('/src/example/entry-server.jsx'))
      .render

    const rendered = await render(url)

    let html = template
      .replace(`<!--app-head-->`, rendered.head ?? '')
      .replace(`<!--app-html-->`, rendered.html ?? '')

    const dir = 'client/assets'
    const target = `./${dir}/${(await readdir(`./dist/${dir}`))[0]}`
    if (isBuild) {
      html = html
        .replace('<script type="module" src="/@vite/client"></script>', '')
        .replace('/src/example/entry-client.jsx', target)
    }

    res.status(200).set({ 'Content-Type': 'text/html' }).send(html)
  } catch (e) {
    vite?.ssrFixStacktrace(e)
    console.log(e.stack)
    res.status(500).end(e.stack)
  }
})

// Start http server
const server = app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
  if (!isBuild) {
    return
  }

  ;(async () => {
    console.log('Loading resources...')
    // Fetching the site finishes when all is built
    const res = await fetch(`http://localhost:${port}`)
    const body = await res.arrayBuffer()
    await writeFile("./dist/index.html", new Uint8Array(body))
    await unlink("./dist/client/index.html").catch(() => {})
    console.log('...finished')
    console.log('Closing server')
    server.close(() => {
      console.log('done')
      process.exit()
    })
  })()
    .then(
      () => {},
      error => {
        console.error(error)
        server.close((error) => {
          console.error(error)
          process.exit(1)
        })
      }
    )
})
