import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import playlistRoutes from './routes/playlists.js';
import scheduleRoutes from './routes/schedule.js';
import uploadRoutes from './routes/upload.js';
import statsRoutes from './routes/stats.js';
import { initDatabase } from './db/init.js';
import { broadcastStats } from './services/stats.js';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/stats', statsRoutes);

// WebSocket pour stats en temps réel
wss.on('connection', (ws) => {
  console.log('Client connecté aux stats temps réel');
  
  ws.on('close', () => {
    console.log('Client déconnecté');
  });
});

// Broadcast stats toutes les 5 secondes
setInterval(() => {
  broadcastStats(wss);
}, 5000);

const PORT = process.env.PORT || 3000;

initDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`API Radio Kambove démarrée sur le port ${PORT}`);
  });
}).catch(err => {
  console.error('Erreur initialisation base de données:', err);
  process.exit(1);
});
