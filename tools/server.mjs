// Zero-dependency static file server for public/.
// Usage: npm start            (PORT env var overrides the default 8081)

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const PORT = Number(process.env.PORT) || 8081;
// Optional URL prefix, e.g. BASE=/statistical-applets to mimic a GitHub Pages project site.
const BASE = (process.env.BASE || '').replace(/\/+$/, '');

const TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.htm': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.otf': 'font/otf',
    '.eot': 'application/vnd.ms-fontobject',
    '.swf': 'application/x-shockwave-flash',
    '.jar': 'application/java-archive',
    '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
    let urlPath;
    try {
        urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch {
        res.writeHead(400).end('Bad request');
        return;
    }
    if (BASE) {
        if (urlPath !== BASE && !urlPath.startsWith(BASE + '/')) {
            res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
            return;
        }
        urlPath = urlPath.slice(BASE.length) || '/';
    }
    let file = path.join(ROOT, path.normalize(urlPath));
    if (!file.startsWith(ROOT)) {
        res.writeHead(403).end('Forbidden');
        return;
    }
    fs.stat(file, (err, stat) => {
        if (!err && stat.isDirectory()) {
            if (!urlPath.endsWith('/')) {
                res.writeHead(301, { Location: BASE + urlPath + '/' }).end();
                return;
            }
            file = path.join(file, 'index.html');
        }
        fs.readFile(file, (readErr, data) => {
            if (readErr) {
                console.log(`404 ${urlPath}`);
                res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
                return;
            }
            res.writeHead(200, {
                'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
                'Cache-Control': 'no-cache'
            });
            res.end(data);
        });
    });
});

server.listen(PORT, () => {
    console.log(`Statistical applets: http://localhost:${PORT}${BASE}/`);
});
