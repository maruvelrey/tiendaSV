// Servidor estático sin dependencias. Uso: node server.js
const http = require('http'), https = require('https');
const fs = require('fs'), path = require('path'), os = require('os');

const PORT = process.env.PORT || 3000;
const DIR = path.join(__dirname, 'public');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon'
};

const handler = (req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.join(DIR, path.normalize(p));
  if (!file.startsWith(DIR)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('No encontrado'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
};

// Si existen key.pem y cert.pem, arranca en HTTPS automáticamente
const keyF = path.join(__dirname, 'key.pem'), certF = path.join(__dirname, 'cert.pem');
const secure = fs.existsSync(keyF) && fs.existsSync(certF);
const server = secure
  ? https.createServer({ key: fs.readFileSync(keyF), cert: fs.readFileSync(certF) }, handler)
  : http.createServer(handler);

server.listen(PORT, '0.0.0.0', () => {
  const proto = secure ? 'https' : 'http';
  console.log(`\nFacturas listo:\n  Esta computadora: ${proto}://localhost:${PORT}`);
  for (const list of Object.values(os.networkInterfaces()))
    for (const i of list) if (i.family === 'IPv4' && !i.internal)
      console.log(`  En tu red (iPhone): ${proto}://${i.address}:${PORT}`);
  console.log('');
});
