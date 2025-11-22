-- Table pour les paramètres de configuration de la radio
CREATE TABLE public.radio_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.radio_settings ENABLE ROW LEVEL SECURITY;

-- RLS: Tout le monde peut lire, seuls les admins peuvent modifier
CREATE POLICY "Anyone can view radio settings"
  ON public.radio_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage radio settings"
  ON public.radio_settings FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Insérer les paramètres par défaut
INSERT INTO public.radio_settings (setting_key, setting_value) VALUES
  ('radio_name', 'Radio Kambove Tabernacle'),
  ('radio_description', 'La parole de Dieu 24/7'),
  ('zeno_stream_url', ''),
  ('zeno_stream_key', ''),
  ('zeno_metadata_enabled', 'true'),
  ('butt_port', '8000'),
  ('butt_password', ''),
  ('butt_mount_point', '/live'),
  ('audio_bitrate', '128'),
  ('audio_samplerate', '44100');

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_radio_settings_updated_at
  BEFORE UPDATE ON public.radio_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();