-- Ajouter les colonnes nécessaires pour programmer des événements ponctuels
ALTER TABLE scheduled_events 
ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'recurring' CHECK (event_type IN ('recurring', 'one_time')),
ADD COLUMN IF NOT EXISTS scheduled_date DATE,
ADD COLUMN IF NOT EXISTS song_id UUID REFERENCES songs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Modifier day_of_week pour qu'il soit nullable (pour les événements ponctuels)
ALTER TABLE scheduled_events 
ALTER COLUMN day_of_week DROP NOT NULL;

-- Modifier start_time et end_time pour être nullable aussi
ALTER TABLE scheduled_events 
ALTER COLUMN start_time DROP NOT NULL,
ALTER COLUMN end_time DROP NOT NULL;

-- Ajouter un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_scheduled_events_date ON scheduled_events(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_events_type ON scheduled_events(event_type);

-- Créer une fonction pour récupérer les événements à venir
CREATE OR REPLACE FUNCTION get_upcoming_events(days_ahead INTEGER DEFAULT 7)
RETURNS TABLE (
  id UUID,
  event_type TEXT,
  title TEXT,
  description TEXT,
  scheduled_date DATE,
  start_time TIME,
  end_time TIME,
  day_of_week INTEGER,
  song_id UUID,
  song_title TEXT,
  song_artist TEXT,
  playlist_id UUID
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.event_type,
    e.title,
    e.description,
    e.scheduled_date,
    e.start_time,
    e.end_time,
    e.day_of_week,
    e.song_id,
    s.title as song_title,
    s.artist as song_artist,
    e.playlist_id
  FROM scheduled_events e
  LEFT JOIN songs s ON e.song_id = s.id
  WHERE 
    (e.event_type = 'one_time' AND e.scheduled_date >= CURRENT_DATE AND e.scheduled_date <= CURRENT_DATE + days_ahead)
    OR e.event_type = 'recurring'
  ORDER BY 
    CASE 
      WHEN e.event_type = 'one_time' THEN e.scheduled_date
      ELSE CURRENT_DATE
    END,
    e.start_time;
END;
$$;