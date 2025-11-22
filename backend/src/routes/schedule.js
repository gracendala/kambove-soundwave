import express from 'express';
import { pool } from '../db/init.js';
import { authMiddleware } from './auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT se.*, s.title as song_title, s.artist
      FROM scheduled_events se
      JOIN songs s ON se.song_id = s.id
      WHERE se.active = true
      ORDER BY se.scheduled_time
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur get schedule:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, songId, scheduledTime, daysOfWeek } = req.body;
    const result = await pool.query(
      'INSERT INTO scheduled_events (name, song_id, scheduled_time, days_of_week) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, songId, scheduledTime, daysOfWeek]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur create schedule:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, songId, scheduledTime, daysOfWeek, active } = req.body;
    const result = await pool.query(
      'UPDATE scheduled_events SET name = $1, song_id = $2, scheduled_time = $3, days_of_week = $4, active = $5 WHERE id = $6 RETURNING *',
      [name, songId, scheduledTime, daysOfWeek, active, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur update schedule:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM scheduled_events WHERE id = $1', [req.params.id]);
    res.json({ message: 'Événement supprimé' });
  } catch (error) {
    console.error('Erreur delete schedule:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
