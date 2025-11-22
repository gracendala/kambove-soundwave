-- Corriger le search_path de la fonction pour la sécurité
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
SECURITY DEFINER
SET search_path = public
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