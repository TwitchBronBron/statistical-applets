#!/usr/bin/env node
// Mirrors original (un-rewritten) files from the Wayback Machine into public/.
//
// Usage: node tools/fetch-wayback.mjs <path> [<path> ...]
//   <path> is relative to ORIGIN, e.g. "stats_applet/stats_applet_1_anova.html".
//
// Uses the `id_` capture mode so Wayback returns the raw bytes it archived (no
// toolbar, no wombat URL rewriting). HTML/CSS/JS files are scanned for relative
// references, which are fetched recursively. Existing files are skipped unless
// --force is passed.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ORIGIN = 'http://digitalfirst.bfwpub.com/';
const TIMESTAMP = '2018';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

const args = process.argv.slice(2);
const force = args.includes('--force');
const queue = args.filter(a => !a.startsWith('--'));
const seen = new Set();
const missing = [];

function waybackUrl(rel) {
    return `https://web.archive.org/web/${TIMESTAMP}id_/${ORIGIN}${rel}`;
}

async function fetchWithRetry(url, tries = 4) {
    for (let i = 1; ; i++) {
        try {
            const res = await fetch(url, { redirect: 'follow' });
            if (res.status === 404) {
                return null;
            }
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            const buf = Buffer.from(await res.arrayBuffer());
            if (buf.includes('Internet Archive: Temporarily Offline')) {
                throw new Error('archive temporarily offline');
            }
            // The origin served its default page for files it didn't have, and Wayback
            // archived that as a 200, so treat it as missing.
            if (buf.includes('Digital First subtypes on staging server')) {
                return null;
            }
            return buf;
        } catch (e) {
            if (i >= tries) {
                throw e;
            }
            await new Promise(r => setTimeout(r, 2000 * i));
        }
    }
}

// Pull relative references out of a text file so their targets get mirrored too.
function findRefs(rel, text) {
    const ext = path.extname(rel).toLowerCase();
    const refs = [];
    const patterns = ext === '.css'
        ? [/url\(\s*['"]?([^'")]+)['"]?\s*\)/g, /@import\s+['"]([^'"]+)['"]/g]
        : [/\b(?:src|href|data-mmsrc|data-altsrc)\s*=\s*["']([^"']+)["']/g];
    for (const re of patterns) {
        for (const m of text.matchAll(re)) {
            refs.push(m[1]);
        }
    }
    const out = [];
    for (let ref of refs) {
        ref = ref.split('#')[0].split('?')[0].trim();
        // skip absolute URLs, and anything without a file extension (JS string false positives)
        if (!ref || /^(?:[a-z]+:|\/\/|#)/i.test(ref) || !/\.[a-z0-9]+$/i.test(ref)) {
            continue;
        }
        const resolved = ref.startsWith('/')
            ? ref.slice(1)
            : path.posix.normalize(path.posix.join(path.posix.dirname(rel), ref));
        // vendor/ is ours (not on the original server); its refs live in patched files
        if (!resolved.startsWith('..') && !resolved.includes('vendor/')) {
            out.push(resolved);
        }
    }
    return out;
}

// Root-absolute refs ("/figure_placeholder.jpg") break when the site is served from a
// subpath (e.g. GitHub Pages project sites), so make them relative to the file.
function relativizeRootRefs(rel, html) {
    // also drop the dead Brightcove video loader (no applet uses video)
    html = html.replace(/<script[^>]*admin\.brightcove\.com[^>]*><\/script>\r?\n?/g, '');
    return html.replace(/\b(src|href)=(["'])\/(?!\/)([^"']*)\2/g, (m, attr, q, target) => {
        const relTarget = path.posix.relative(path.posix.dirname(rel), target);
        return `${attr}=${q}${relTarget}${q}`;
    });
}

async function mirror(rel) {
    if (seen.has(rel)) {
        return;
    }
    seen.add(rel);
    const dest = path.join(ROOT, rel);
    let buf;
    try {
        buf = force ? null : await fs.readFile(dest);
    } catch { }
    if (!buf) {
        buf = await fetchWithRetry(waybackUrl(rel));
        if (!buf) {
            console.log(`MISSING  ${rel}`);
            missing.push(rel);
            return;
        }
        if (/\.html?$/i.test(rel)) {
            buf = Buffer.from(relativizeRootRefs(rel, buf.toString('utf8')));
        }
        await fs.mkdir(path.dirname(dest), { recursive: true });
        await fs.writeFile(dest, buf);
        console.log(`fetched  ${rel} (${buf.length} bytes)`);
    }
    if (/\.(html?|css|js)$/i.test(rel)) {
        for (const ref of findRefs(rel, buf.toString('utf8'))) {
            queue.push(ref);
        }
    }
}

while (queue.length) {
    await mirror(queue.shift());
}
if (missing.length) {
    console.log(`\n${missing.length} file(s) not in the archive:\n  ${missing.join('\n  ')}`);
}
