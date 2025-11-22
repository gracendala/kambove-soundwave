import express from 'express';
import { pool } from '../db/init.js';
import { authMiddleware } from './auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/play', async (req, res) => {
  try {
    const { songId, listenerCount } = req.body;
    await pool.query(
      'INSERT INTO listen_stats (song_id, listener_count) VALUES ($1, $2)',
      [songId, listenerCount || 0]
    );
    res.json({ message: 'Statistique enregistrée' });
  } catch (error) {
    console.error('Erreur record stat:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const totalSongs = await pool.query('SELECT COUNT(*) FROM songs');
    const totalPlays = await pool.query('SELECT COUNT(*) FROM listen_stats WHERE played_at > NOW() - INTERVAL \'24 hours\'');
    const currentListeners = await pool.query('SELECT COALESCE(MAX(listener_count), 0) as count FROM listen_stats WHERE played_at > NOW() - INTERVAL \'5 minutes\'');
    
    const topSongs = await pool.query(`
      SELECT s.title, s.artist, COUNT(ls.id) as play_count
      FROM songs s
      LEFT JOIN listen_stats ls ON s.id = ls.song_id
      WHERE ls.played_at > NOW() - INTERVAL '7 days'
      GROUP BY s.id, s.title, s.artist
      ORDER BY play_count DESC
      LIMIT 10
    `);

    res.json({
      totalSongs: parseInt(totalSongs.rows[0].count),
      playsLast24h: parseInt(totalPlays.rows[0].count),
      currentListeners: parseInt(currentListeners.rows[0].count),
      topSongs: topSongs.rows
    });
  } catch (error) {
    console.error('Erreur get stats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE_TRUNC('hour', played_at) as hour,
        AVG(listener_count) as avg_listeners
      FROM listen_stats
      WHERE played_at > NOW() - INTERVAL '24 hours'
      GROUP BY hour
      ORDER BY hour
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur get history:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
