import fs from 'fs/promises';
import path, { dirname } from 'node:path';
import express from 'express';
import { fileURLToPath } from 'node:url';
const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const resolve = (p) => path.resolve(__dirname, '../../', p);

export async function createServer(root = process.cwd(), isProd = process.env.NODE_ENV === 'production', hmrPort) {
    // 1.创建express
    const app = express();

    // 2.获取html模板 index
    const baseTemplate = await fs.readFile(isProd ? resolve('dist/client/index.html') : resolve('index.html'), 'utf-8');

    // 3.生产环境获取manifest
    const manifest = isProd
        ? JSON.parse(await fs.readFile(resolve('dist/client/.vite/ssr-manifest.json'), 'utf-8'))
        : {};

    let vite;

    if (!isProd) {
        // Create Vite server in middleware mode and configure the app type as
        // 'custom', disabling Vite's own HTML serving logic so parent server
        // can take control
        vite = await (
            await import('vite')
        ).createServer({
            base: '/',
            root,
            logLevel: isTest ? 'error' : 'info',
            server: {
                middlewareMode: true,
                watch: {
                    // During tests we edit the files too fast and sometimes chokidar
                    // misses change events, so enforce polling for consistency
                    usePolling: true,
                    interval: 100,
                },
                hmr: {
                    port: hmrPort,
                },
            },
            appType: 'custom',
        });
        // use vite's connect instance as middleware
        app.use(vite.middlewares);
    } else {
        app.use((await import('compression')).default());
        app.use(
            '/',
            (await import('serve-static')).default(resolve('dist/client'), {
                index: false,
            }),
        );
    }

    const assetsDir = resolve('public');
    const requestHandler = express.static(assetsDir);
    app.use(requestHandler);
    app.use('/public', requestHandler);

    app.use('*', async (req, res, next) => {
        const url = req.originalUrl;
        let template, render;

        if (!isProd) {
            // always read fresh template in dev
            template = await vite.transformIndexHtml(url, baseTemplate);
            render = (await vite.ssrLoadModule(resolve('src/entry-server.tsx'))).render;
        } else {
            template = baseTemplate;
            render = (await import('../../dist/server/entry-server.js')).render;
        }

        try {
            await render(req, res, template);
        } catch (e) {
            !isProd && vite.ssrFixStacktrace(e);
            // If an error is caught, let Vite fix the stack trace so it maps back to
            // your actual source code.
            vite.ssrFixStacktrace(e);
            next(e);
        }
    });
    return { app, vite };
}

createServer().then(({ app }) => {
    const port = process.env.PORT || 3000;
    app.listen(Number(port), '0.0.0.0', () => {
        console.log(`http://localhost:${port}`);
    });
});
