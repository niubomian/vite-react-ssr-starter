import { renderToString, renderToPipeableStream } from 'react-dom/server';
import App from '@/App';
import { Request, Response } from 'express';

export async function render(req: Request, res: Response, template: string) {
    if (typeof ReadableStream !== 'undefined') {
        const { pipe } = renderToPipeableStream(<App ssr={true} location={req.originalUrl} />, {
            onShellReady() {
                res.setHeader('content-type', 'text/html; charset=utf-8');
                const data = template.split('<!--app-html-->');
                res.write(data[0]);
                pipe(res);
                res.write(data[1]);
            },
        });
    } else {
        const pre = renderToString(<App ssr={true} location={req.originalUrl} />);
        const html = template.replace(`<!--app-html-->`, pre);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.status(200).send(html);
    }
}
