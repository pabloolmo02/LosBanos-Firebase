import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf'
};

function sendFile(filePath, res) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal Server Error');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const headers = {
      'Content-Type': contentType
    };

    if (
      ext === '.js' ||
      ext === '.mjs' ||
      ext === '.css' ||
      ext === '.png' ||
      ext === '.jpg' ||
      ext === '.jpeg' ||
      ext === '.webp' ||
      ext === '.svg' ||
      ext === '.woff' ||
      ext === '.woff2'
    ) {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    } else if (ext === '.html') {
      headers['Cache-Control'] = 'no-cache';
    }

    res.writeHead(200, headers);
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const safePath = path.normalize(urlPath).replace(/^([.][.][/\\])+/, '');

  let filePath = path.join(DIST_DIR, safePath);

  if (safePath === '/' || safePath === '') {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  fs.stat(filePath, (error, stats) => {
    if (!error && stats.isFile()) {
      sendFile(filePath, res);
      return;
    }

    if (!error && stats.isDirectory()) {
      const indexInDir = path.join(filePath, 'index.html');
      fs.stat(indexInDir, (dirErr, dirStats) => {
        if (!dirErr && dirStats.isFile()) {
          sendFile(indexInDir, res);
          return;
        }

        const fallback = path.join(DIST_DIR, 'index.html');
        sendFile(fallback, res);
      });
      return;
    }

    const fallback = path.join(DIST_DIR, 'index.html');
    fs.stat(fallback, (fallbackError, fallbackStats) => {
      if (!fallbackError && fallbackStats.isFile()) {
        sendFile(fallback, res);
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('dist/index.html not found. Run: npm run build');
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
