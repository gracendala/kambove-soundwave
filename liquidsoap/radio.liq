#!/usr/bin/liquidsoap

# Configuration
set("log.file.path", "/var/log/liquidsoap/radio.log")
set("log.level", 3)

# Playlist principale
principale = playlist(
  mode="randomize",
  reload_mode="watch",
  "/playlists/principale.m3u"
)

# Musique de secours (silence si pas de fichiers)
secours = single("/playlists/secours.mp3")

# Fallback: principale en priorité, sinon secours
radio = fallback(
  track_sensitive=false,
  [principale, secours]
)

# Normalisation audio
radio = normalize(radio)

# Compression dynamique
radio = compress(radio)

# Streaming vers Icecast
output.icecast(
  %mp3(bitrate=128),
  host="icecast",
  port=8000,
  password="hackme",
  mount="/radio",
  name="Radio Kambove Tabernacle",
  description="Radio Kambove Tabernacle - Diffusion en direct",
  genre="Gospel",
  url="http://localhost:8000",
  radio
)
