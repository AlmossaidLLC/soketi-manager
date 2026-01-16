import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let soketiProcess = null;
let managerProcess = null;
const PID_FILE = join(__dirname, '.soketi.pid');

// Function to start Soketi
function startSoketi() {
  console.log('🚀 Starting Soketi...');
  
  // Use the official Soketi server.js directly (from base image)
  const soketiScript = '/app/bin/server.js';
  const soketiArgs = ['start', '--config', '/app/soketi.json'];
  
  soketiProcess = spawn('node', [soketiScript, ...soketiArgs], {
    stdio: 'inherit',
    shell: false,
    detached: false,
    cwd: '/app',
    env: {
      ...process.env,
      PATH: process.env.PATH,
      NODE_PATH: '/app/node_modules'
    }
  });

  // Save PID immediately
  if (soketiProcess.pid) {
    writeFileSync(PID_FILE, soketiProcess.pid.toString());
    console.log(`✅ Soketi started with PID: ${soketiProcess.pid}`);
  }

  soketiProcess.on('error', (error) => {
    console.error('❌ Soketi error:', error);
  });

  soketiProcess.on('exit', (code, signal) => {
    console.log(`⚠️  Soketi exited with code ${code}, signal ${signal}`);
    // Don't auto-restart if it was intentionally killed
    if (code !== 0 && code !== null && signal !== 'SIGTERM' && signal !== 'SIGINT') {
      console.log('🔄 Restarting Soketi in 2 seconds...');
      setTimeout(() => {
        if (!soketiProcess || soketiProcess.killed) {
          startSoketi();
        }
      }, 2000);
    }
  });

  return soketiProcess;
}

// Function to start App Manager
function startManager() {
  console.log('🚀 Starting App Manager...');
  
  managerProcess = spawn('node', ['src/index.js'], {
    stdio: 'inherit',
    shell: false,
    detached: false,
    env: {
      ...process.env
    }
  });

  managerProcess.on('error', (error) => {
    console.error('❌ App Manager error:', error);
  });

  managerProcess.on('exit', (code, signal) => {
    console.log(`⚠️  App Manager exited with code ${code}, signal ${signal}`);
    // Don't auto-restart if it was intentionally killed
    if (code !== 0 && code !== null && signal !== 'SIGTERM' && signal !== 'SIGINT') {
      console.log('🔄 Restarting App Manager in 2 seconds...');
      setTimeout(() => {
        if (!managerProcess || managerProcess.killed) {
          startManager();
        }
      }, 2000);
    }
  });

  return managerProcess;
}

// Handle shutdown gracefully
function shutdown() {
  console.log('🛑 Shutting down gracefully...');
  
  if (soketiProcess && !soketiProcess.killed) {
    console.log('Stopping Soketi...');
    soketiProcess.kill('SIGTERM');
  }
  
  if (managerProcess && !managerProcess.killed) {
    console.log('Stopping App Manager...');
    managerProcess.kill('SIGTERM');
  }
  
  // Clean up PID file
  if (existsSync(PID_FILE)) {
    try {
      require('fs').unlinkSync(PID_FILE);
    } catch (e) {
      // Ignore
    }
  }
  
  setTimeout(() => {
    process.exit(0);
  }, 2000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start both services
console.log('🎉 Starting Soketi App Manager...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

startSoketi();

// Wait for Soketi to start before starting manager
setTimeout(() => {
  startManager();
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ All services started!');
  console.log('📊 App Manager: http://localhost:3000');
  console.log('🔌 Soketi WebSocket: ws://localhost:6001');
}, 3000);

// Keep process alive
process.on('exit', () => {
  console.log('👋 Goodbye!');
});
