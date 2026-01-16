import { existsSync, readFileSync, writeFileSync } from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG_FILE } from '../config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to get Soketi PID from file
export function getSoketiPid() {
  try {
    const pidFile = path.join(__dirname, '../../.soketi.pid');
    if (existsSync(pidFile)) {
      const pid = parseInt(readFileSync(pidFile, 'utf-8').trim());
      return pid;
    }
  } catch (error) {
    console.error('Error reading Soketi PID:', error);
  }
  return null;
}

// Helper function to detect if running in Docker
function isDockerEnvironment() {
  return existsSync('/app/bin/server.js');
}

// Helper function to get Soketi command and args
function getSoketiCommand() {
  if (isDockerEnvironment()) {
    // Docker environment - use the server.js from the base image
    return {
      command: 'node',
      args: ['/app/bin/server.js', 'start', '--config', CONFIG_FILE],
      options: {
        detached: true,
        stdio: 'ignore',
        cwd: '/app',
        env: {
          ...process.env,
          PATH: process.env.PATH,
          NODE_PATH: '/app/node_modules'
        }
      }
    };
  } else {
    // Local development - use soketi command (should be installed globally or in node_modules)
    // Try to find soketi in node_modules first, then fall back to global
    const projectRoot = path.join(__dirname, '../../');
    const localSoketi = path.join(projectRoot, 'node_modules', '.bin', 'soketi');
    
    if (existsSync(localSoketi)) {
      return {
        command: localSoketi,
        args: ['start', '--config', CONFIG_FILE],
        options: {
          detached: true,
          stdio: 'ignore',
          cwd: projectRoot,
          env: process.env
        }
      };
    } else {
      // Try global soketi command
      return {
        command: 'soketi',
        args: ['start', '--config', CONFIG_FILE],
        options: {
          detached: true,
          stdio: 'ignore',
          cwd: projectRoot,
          env: process.env
        }
      };
    }
  }
}

// Helper function to restart Soketi process
export async function restartSoketi() {
  try {
    const pid = getSoketiPid();
    
    if (pid) {
      // Kill existing Soketi process
      try {
        process.kill(pid, 'SIGTERM');
        // Wait a bit for graceful shutdown
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        // Process might already be dead, try SIGKILL
        try {
          process.kill(pid, 'SIGKILL');
        } catch (e) {
          // Ignore if process doesn't exist
        }
      }
    }

    // Get the appropriate command for the environment
    const soketiCmd = getSoketiCommand();
    
    // Start new Soketi process with promise-based error handling
    const result = await new Promise((resolve) => {
      const newProcess = spawn(soketiCmd.command, soketiCmd.args, soketiCmd.options);

      // Handle spawn errors (e.g., command not found)
      newProcess.on('error', (error) => {
        let errorMessage = 'Failed to start Soketi';
        if (error.code === 'ENOENT') {
          errorMessage = 'Soketi command not found. For local development, install it with: npm install -g @soketi/soketi';
          console.error(`❌ ${errorMessage}`);
        } else {
          console.error('❌ Error starting Soketi:', error.message);
          errorMessage = `Failed to start Soketi: ${error.message}`;
        }
        
        resolve({
          success: false,
          message: errorMessage,
          error: error.message || 'Process spawn failed'
        });
      });

      // If process starts successfully
      newProcess.once('spawn', () => {
        // Unref to allow Node.js to exit if this is the only process
        newProcess.unref();

        // Save new PID
        const pidFile = path.join(__dirname, '../../.soketi.pid');
        writeFileSync(pidFile, newProcess.pid.toString(), 'utf-8');

        console.log(`✅ Soketi restarted with PID: ${newProcess.pid}`);

        resolve({ 
          success: true, 
          message: 'Soketi restarted successfully',
          pid: newProcess.pid
        });
      });

      // Fallback check after a short delay (in case 'spawn' event doesn't fire)
      setTimeout(() => {
        if (newProcess.pid && !newProcess.killed) {
          // Process started successfully
          newProcess.unref();
          const pidFile = path.join(__dirname, '../../.soketi.pid');
          writeFileSync(pidFile, newProcess.pid.toString(), 'utf-8');
          console.log(`✅ Soketi restarted with PID: ${newProcess.pid}`);
          resolve({ 
            success: true, 
            message: 'Soketi restarted successfully',
            pid: newProcess.pid
          });
        }
      }, 200);
    });

    return result;

  } catch (error) {
    return { 
      success: false, 
      message: 'Failed to restart Soketi', 
      error: error.message 
    };
  }
}
