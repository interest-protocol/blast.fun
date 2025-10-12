// scripts/dev-supervisor.cjs
const { spawn } = require('child_process');
const kill = require('tree-kill');
const http = require('http');
const path = require('path');
const args = require('minimist')(process.argv.slice(2));
const { getSupervisorPort, cleanupSupervisorPort } = require('./port-manager.cjs');

const APP_PORT = String(args.p || process.env.PORT || 3000);
const TOKEN = String(args.t || process.env.RESTART_TOKEN || 'dev-restart');

let child = null;
let CTRL_PORT = null;

function start() {
  const nextBin = path.join('node_modules', '.bin', 'next');
  const nextArgs = ['dev', '-p', APP_PORT];
  child = spawn(process.platform === 'win32' ? 'node' : nextBin,
    process.platform === 'win32' ? [nextBin, ...nextArgs] : nextArgs,
    { stdio: 'inherit', env: { ...process.env, PORT: APP_PORT } }
  );
  child.on('exit', (code, signal) => {
    console.log(`[supervisor] child exited code=${code} signal=${signal}`);
  });
}

function restart(cb) {
  if (!child || child.killed) { start(); return cb && cb(); }
  console.log('[supervisor] restarting next dev…');
  kill(child.pid, 'SIGTERM', () => { start(); cb && cb(); });
}

async function init() {
  // Get supervisor port dynamically
  CTRL_PORT = await getSupervisorPort(APP_PORT);
  
  // start next dev once
  start();

  // tiny control server
  const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url.startsWith('/restart')) {
      // simple token check: /restart?token=XXX
      const ok = req.url.includes(`token=${encodeURIComponent(TOKEN)}`);
      if (!ok) { res.statusCode = 401; return res.end('bad token'); }
      restart(() => { res.end('restarted'); });
    } else {
      res.statusCode = 404; res.end('not found');
    }
  });

  server.listen(CTRL_PORT, '127.0.0.1', () => {
    console.log(`[supervisor] control at http://127.0.0.1:${CTRL_PORT}/restart?token=${TOKEN}`);
    console.log(`[supervisor] app     at http://localhost:${APP_PORT}`);
  });
}

// Initialize async
init().catch(error => {
  console.error('[supervisor] init error:', error);
  process.exit(1);
});

// graceful shutdown
['SIGINT', 'SIGTERM'].forEach(sig => {
  process.on(sig, () => {
    // Clean up supervisor port mapping
    cleanupSupervisorPort(APP_PORT);
    if (child && !child.killed) kill(child.pid, 'SIGTERM', () => process.exit(0));
    else process.exit(0);
  });
});