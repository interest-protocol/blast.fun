// scripts/dev-restart.cjs
const http = require('http');
const fs = require('fs');
const path = require('path');

const TOKEN = String(process.env.RESTART_TOKEN || 'dev-restart');
const SUPERVISOR_PORT_FILE = path.join('generated', 'prisma', 'supervisor-port.json');

async function restartAll() {
  // Read all supervisor ports from file
  let portMappings = {};
  if (fs.existsSync(SUPERVISOR_PORT_FILE)) {
    try {
      const content = fs.readFileSync(SUPERVISOR_PORT_FILE, 'utf8');
      portMappings = JSON.parse(content);
    } catch (error) {
      console.error('[dev-restart] Could not read supervisor port file');
      return;
    }
  } else {
    console.log('[dev-restart] No supervisor port file found');
    return;
  }

  const requestPath = `/restart?token=${encodeURIComponent(TOKEN)}`;
  const ports = Object.values(portMappings);

  if (ports.length === 0) {
    console.log('[dev-restart] No supervisor ports found');
    return;
  }

  await Promise.all(ports.map(port => new Promise((resolve) => {
    const opts = { host: '127.0.0.1', port, path: requestPath, method: 'POST' };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        console.log(`[dev-restart] port ${port}: ${res.statusCode} ${data}`);
        resolve();
      });
    });
    req.on('error', (e) => {
      console.error(`[dev-restart] port ${port} error:`, e.message);
      resolve();
    });
    req.end();
  })));
}

restartAll();