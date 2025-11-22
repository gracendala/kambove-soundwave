import express from 'express';
import { pool } from '../db/init.js';
import { authMiddleware } from './auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, 
        COUNT(pi.id) as song_count,
        COALESCE(SUM(s.duration), 0) as total_duration
      FROM playlists p
      LEFT JOIN playlist_items pi ON p.id = pi.playlist_id
      LEFT JOIN songs s ON pi.song_id = s.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur get playlists:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await pool.query(
      'INSERT INTO playlists (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur create playlist:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/:id/songs', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, pi.position
      FROM songs s
      JOIN playlist_items pi ON s.id = pi.song_id
      WHERE pi.playlist_id = $1
      ORDER BY pi.position
    `, [req.params.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur get playlist songs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/:id/songs', async (req, res) => {
  try {
    const { songId, position } = req.body;
    const result = await pool.query(
      'INSERT INTO playlist_items (playlist_id, song_id, position) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, songId, position]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur add song to playlist:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM playlists WHERE id = $1', [req.params.id]);
    res.json({ message: 'Playlist supprimée' });
  } catch (error) {
    console.error('Erreur delete playlist:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
