import express from 'express';
import { readConfig, writeConfig } from '../config/config.js';
import { restartSoketi } from '../services/soketi.js';

const router = express.Router();

// GET /api/apps - Get all apps
router.get('/', async (req, res) => {
  try {
    const config = await readConfig();
    const apps = config.appManager.array.apps.map(app => ({
      ...app,
      secret: undefined // Don't expose secrets in list
    }));
    res.json({ success: true, apps });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/apps/:id - Get specific app
router.get('/:id', async (req, res) => {
  try {
    const config = await readConfig();
    const app = config.appManager.array.apps.find(a => a.id === req.params.id);
    if (!app) {
      return res.status(404).json({ success: false, error: 'App not found' });
    }
    res.json({ success: true, app });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/apps - Create new app
router.post('/', async (req, res) => {
  try {
    const config = await readConfig();
    const newApp = {
      id: req.body.id,
      key: req.body.key,
      secret: req.body.secret,
      enabled: req.body.enabled !== undefined ? req.body.enabled : true,
      enableClientMessages: req.body.enableClientMessages !== undefined ? req.body.enableClientMessages : true,
      maxConnections: req.body.maxConnections || 100
    };

    // Validate required fields
    if (!newApp.id || !newApp.key || !newApp.secret) {
      return res.status(400).json({ success: false, error: 'Missing required fields: id, key, secret' });
    }

    // Check if app ID already exists
    if (config.appManager.array.apps.find(a => a.id === newApp.id)) {
      return res.status(400).json({ success: false, error: 'App ID already exists' });
    }

    // Check if app key already exists
    if (config.appManager.array.apps.find(a => a.key === newApp.key)) {
      return res.status(400).json({ success: false, error: 'App key already exists' });
    }

    config.appManager.array.apps.push(newApp);
    await writeConfig(config);
    
    const restartResult = await restartSoketi();
    
    res.json({ 
      success: true, 
      app: { ...newApp, secret: undefined },
      restart: restartResult
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/apps/:id - Update app
router.put('/:id', async (req, res) => {
  try {
    const config = await readConfig();
    const appIndex = config.appManager.array.apps.findIndex(a => a.id === req.params.id);
    
    if (appIndex === -1) {
      return res.status(404).json({ success: false, error: 'App not found' });
    }

    const updatedApp = {
      ...config.appManager.array.apps[appIndex],
      ...req.body,
      id: req.params.id // Don't allow changing ID
    };

    // If key is being changed, check for duplicates
    if (req.body.key && req.body.key !== config.appManager.array.apps[appIndex].key) {
      if (config.appManager.array.apps.find(a => a.key === req.body.key && a.id !== req.params.id)) {
        return res.status(400).json({ success: false, error: 'App key already exists' });
      }
    }

    config.appManager.array.apps[appIndex] = updatedApp;
    await writeConfig(config);
    
    const restartResult = await restartSoketi();
    
    res.json({ 
      success: true, 
      app: { ...updatedApp, secret: undefined },
      restart: restartResult
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/apps/:id - Delete app
router.delete('/:id', async (req, res) => {
  try {
    const config = await readConfig();
    const appIndex = config.appManager.array.apps.findIndex(a => a.id === req.params.id);
    
    if (appIndex === -1) {
      return res.status(404).json({ success: false, error: 'App not found' });
    }

    config.appManager.array.apps.splice(appIndex, 1);
    await writeConfig(config);
    
    const restartResult = await restartSoketi();
    
    res.json({ 
      success: true, 
      message: 'App deleted successfully',
      restart: restartResult
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
