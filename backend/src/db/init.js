import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'radio_kambove',
  user: process.env.DB_USER || 'radio',
  password: process.env.DB_PASSWORD || 'radio_password',
});

export async function initDatabase() {
  const client = await pool.connect();
  try {
    // Table utilisateurs
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table rôles
    await client.query(`
      CREATE TYPE user_role AS ENUM ('admin', 'operator');
    `).catch(() => {}); // Ignore si déjà existe

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role user_role NOT NULL,
        UNIQUE(user_id, role)
      )
    `);

    // Table playlists
    await client.query(`
      CREATE TABLE IF NOT EXISTS playlists (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table chansons
    await client.query(`
      CREATE TABLE IF NOT EXISTS songs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(255),
        album VARCHAR(255),
        duration INTEGER,
        file_path VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table items de playlist
    await client.query(`
      CREATE TABLE IF NOT EXISTS playlist_items (
        id SERIAL PRIMARY KEY,
        playlist_id INTEGER REFERENCES playlists(id) ON DELETE CASCADE,
        song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
        position INTEGER NOT NULL,
        UNIQUE(playlist_id, song_id)
      )
    `);

    // Table programmation
    await client.query(`
      CREATE TABLE IF NOT EXISTS scheduled_events (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
        scheduled_time TIME NOT NULL,
        days_of_week INTEGER[] NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table statistiques d'écoute
    await client.query(`
      CREATE TABLE IF NOT EXISTS listen_stats (
        id SERIAL PRIMARY KEY,
        song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
        played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        listener_count INTEGER DEFAULT 0
      )
    `);

    // Créer admin par défaut
    const adminExists = await client.query(
      'SELECT id FROM users WHERE username = $1',
      ['admin']
    );

    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const result = await client.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
        ['admin', 'admin@kambove.radio', hashedPassword]
      );
      
      await client.query(
        'INSERT INTO user_roles (user_id, role) VALUES ($1, $2)',
        [result.rows[0].id, 'admin']
      );
      
      console.log('✅ Utilisateur admin créé (username: admin, password: admin123)');
    }

    console.log('✅ Base de données initialisée');
  } finally {
    client.release();
  }
}
