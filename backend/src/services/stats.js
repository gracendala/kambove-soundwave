import { pool } from '../db/init.js';

export async function broadcastStats(wss) {
  try {
    const result = await pool.query(`
      SELECT COALESCE(MAX(listener_count), 0) as listeners
      FROM listen_stats
      WHERE played_at > NOW() - INTERVAL '5 minutes'
    `);

    const stats = {
      type: 'stats_update',
      listeners: parseInt(result.rows[0].listeners),
      timestamp: new Date().toISOString()
    };

    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(stats));
      }
    });
  } catch (error) {
    console.error('Erreur broadcast stats:', error);
  }
}
