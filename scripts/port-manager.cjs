// scripts/port-manager.cjs
const fs = require('fs');
const path = require('path');
const net = require('net');

const SUPERVISOR_PORT_FILE = path.join('generated', 'prisma', 'supervisor-port.json');

// Check if port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, '127.0.0.1', () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', () => resolve(false));
  });
}

// Find an available port starting from basePort
async function findAvailablePort(basePort) {
  for (let port = basePort; port < basePort + 1000; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${basePort}`);
}

// Get or assign supervisor port for given app port
async function getSupervisorPort(appPort) {
  const appPortNum = Number(appPort);
  
  // Ensure directory exists
  const dir = path.dirname(SUPERVISOR_PORT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Read existing port mappings
  let portMappings = {};
  if (fs.existsSync(SUPERVISOR_PORT_FILE)) {
    try {
      const content = fs.readFileSync(SUPERVISOR_PORT_FILE, 'utf8');
      portMappings = JSON.parse(content);
    } catch (error) {
      console.warn('[port-manager] Could not read port file, starting fresh');
    }
  }

  // If we already have a supervisor port for this app port, check if it's still available
  if (portMappings[appPortNum]) {
    const existingPort = portMappings[appPortNum];
    if (await isPortAvailable(existingPort)) {
      return existingPort;
    } else {
      // Port is no longer available, remove it from mappings
      delete portMappings[appPortNum];
    }
  }

  // Find a new available supervisor port
  // Start from 13000 + appPort offset to spread them out
  const basePort = 13000 + (appPortNum % 1000);
  const supervisorPort = await findAvailablePort(basePort);
  
  // Store the mapping
  portMappings[appPortNum] = supervisorPort;
  fs.writeFileSync(SUPERVISOR_PORT_FILE, JSON.stringify(portMappings, null, 2));
  
  console.log(`[port-manager] Assigned supervisor port ${supervisorPort} for app port ${appPortNum}`);
  return supervisorPort;
}

// If called directly, output the supervisor port for given app port
if (require.main === module) {
  const appPort = process.argv[2];
  if (!appPort) {
    console.error('Usage: node port-manager.cjs <app-port>');
    process.exit(1);
  }
  
  getSupervisorPort(appPort)
    .then(port => {
      console.log(port);
    })
    .catch(error => {
      console.error('Error:', error.message);
      process.exit(1);
    });
}

// Clean up supervisor port mapping when supervisor stops
function cleanupSupervisorPort(appPort) {
  const appPortNum = Number(appPort);
  
  if (!fs.existsSync(SUPERVISOR_PORT_FILE)) {
    return;
  }
  
  try {
    const content = fs.readFileSync(SUPERVISOR_PORT_FILE, 'utf8');
    const portMappings = JSON.parse(content);
    
    if (portMappings[appPortNum]) {
      delete portMappings[appPortNum];
      
      // If no more mappings, remove the file entirely
      if (Object.keys(portMappings).length === 0) {
        fs.unlinkSync(SUPERVISOR_PORT_FILE);
        console.log(`[port-manager] Removed supervisor port file`);
      } else {
        fs.writeFileSync(SUPERVISOR_PORT_FILE, JSON.stringify(portMappings, null, 2));
        console.log(`[port-manager] Cleaned up supervisor port for app port ${appPortNum}`);
      }
    }
  } catch (error) {
    console.warn('[port-manager] Could not clean up supervisor port mapping:', error.message);
  }
}

module.exports = { getSupervisorPort, findAvailablePort, cleanupSupervisorPort };