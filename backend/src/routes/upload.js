import express from 'express';
import multer from 'multer';
import path from 'path';
import { parseFile } from 'music-metadata';
import ffmpeg from 'fluent-ffmpeg';
import { pool } from '../db/init.js';
import { authMiddleware } from './auth.js';
import fs from 'fs/promises';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|flac|ogg|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers audio sont autorisés'));
    }
  }
});

router.use(authMiddleware);

router.post('/', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const filePath = req.file.path;
    let convertedPath = filePath;

    // Convertir en MP3 si nécessaire
    if (!filePath.endsWith('.mp3')) {
      convertedPath = filePath.replace(path.extname(filePath), '.mp3');
      
      await new Promise((resolve, reject) => {
        ffmpeg(filePath)
          .toFormat('mp3')
          .audioBitrate(192)
          .on('end', resolve)
          .on('error', reject)
          .save(convertedPath);
      });

      await fs.unlink(filePath); // Supprimer l'original
    }

    // Extraire les métadonnées
    const metadata = await parseFile(convertedPath);
    
    const result = await pool.query(
      'INSERT INTO songs (title, artist, album, duration, file_path) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [
        metadata.common.title || req.file.originalname,
        metadata.common.artist || 'Artiste inconnu',
        metadata.common.album || '',
        Math.floor(metadata.format.duration || 0),
        convertedPath
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload' });
  }
});

router.get('/songs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM songs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur get songs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/songs/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT file_path FROM songs WHERE id = $1', [req.params.id]);
    
    if (result.rows.length > 0) {
      await fs.unlink(result.rows[0].file_path).catch(() => {});
      await pool.query('DELETE FROM songs WHERE id = $1', [req.params.id]);
    }
    
    res.json({ message: 'Chanson supprimée' });
  } catch (error) {
    console.error('Erreur delete song:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
