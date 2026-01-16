import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import appsRouter from './routes/apps.js';
import eventsRouter from './routes/events.js';
import restartRouter from './routes/restart.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/apps', appsRouter);
app.use('/api', eventsRouter);
app.use('/api/restart', restartRouter);

export function startServer() {
  app.listen(PORT, () => {
    console.log(`🚀 App Manager API running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
  });
}

export default app;
