import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config file path - use environment variable or detect location
function getConfigPath() {
    // If environment variable is set, use it
    if (process.env.SOKETI_CONFIG_FILE) {
        return process.env.SOKETI_CONFIG_FILE;
    }
    
    // Check Docker path first (config dir for volume-mounted persistence)
    const dockerPath = '/app/config/soketi.json';
    if (existsSync(dockerPath)) {
        return dockerPath;
    }
    
    // Fall back to project root (for local development)
    // Go up from src/config/config.js to project root
    const projectRoot = path.join(__dirname, '../../');
    const localPath = path.join(projectRoot, 'soketi.json');
    
    return localPath;
}

const CONFIG_FILE = getConfigPath();

// Log the config file path for debugging (only in development)
if (process.env.NODE_ENV !== 'production') {
  console.log(`📁 Using config file: ${CONFIG_FILE}`);
}

const FALLBACK_DEFAULT_PATH = '/app/soketi.json.default';

// Helper function to read config
export async function readConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Try to initialize from default (handles Docker volume mount timing)
      if (existsSync(FALLBACK_DEFAULT_PATH)) {
        try {
          await fs.mkdir(path.dirname(CONFIG_FILE), { recursive: true });
          await fs.copyFile(FALLBACK_DEFAULT_PATH, CONFIG_FILE);
          const data = await fs.readFile(CONFIG_FILE, 'utf-8');
          return JSON.parse(data);
        } catch (initErr) {
          console.error('Failed to initialize config from default:', initErr.message);
        }
      }
      throw new Error(`Config file not found at: ${CONFIG_FILE}. Please ensure soketi.json exists.`);
    }
    throw error;
  }
}

// Helper function to write config
export async function writeConfig(config) {
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

export { CONFIG_FILE };
