# 🎵 Guide de Déploiement - Radio Kambove Tabernacle

## 📋 Prérequis

- Ubuntu Server avec Docker et Portainer installés ✅
- Minimum 2GB RAM, 20GB disque
- Ports disponibles: 80, 3000, 8000

## 🚀 Installation Pas à Pas

### Étape 1: Préparer le Serveur

```bash
# Se connecter en SSH à votre serveur Ubuntu
ssh votre-user@votre-serveur-ip

# Créer la structure du projet
cd /home/votre-user
mkdir -p radio-kambove/{backend,liquidsoap,icecast,playlists,web}
cd radio-kambove
```

### Étape 2: Télécharger les Fichiers du Projet

Depuis votre machine locale, vous devez transférer tous les fichiers backend vers le serveur:

```bash
# Sur votre machine locale, depuis le dossier du projet Lovable
# Construire le frontend
npm run build

# Transférer les fichiers vers le serveur
scp -r backend/ votre-user@votre-serveur-ip:/home/votre-user/radio-kambove/
scp -r liquidsoap/ votre-user@votre-serveur-ip:/home/votre-user/radio-kambove/
scp -r icecast/ votre-user@votre-serveur-ip:/home/votre-user/radio-kambove/
scp -r dist/ votre-user@votre-serveur-ip:/home/votre-user/radio-kambove/web/
scp docker-compose.yml votre-user@votre-serveur-ip:/home/votre-user/radio-kambove/
scp nginx.conf votre-user@votre-serveur-ip:/home/votre-user/radio-kambove/
```

**Ou en une seule commande depuis le dossier parent:**
```bash
tar czf radio-kambove.tar.gz backend/ liquidsoap/ icecast/ dist/ docker-compose.yml nginx.conf
scp radio-kambove.tar.gz votre-user@votre-serveur-ip:/home/votre-user/
ssh votre-user@votre-serveur-ip "cd /home/votre-user && tar xzf radio-kambove.tar.gz && mv dist radio-kambove/web/"
```

### Étape 3: Créer les Fichiers de Configuration Icecast

Sur le serveur:

```bash
cd /home/votre-user/radio-kambove

# Créer le fichier de config Icecast si pas encore fait
cat > icecast/icecast.xml << 'EOF'
<icecast>
    <limits>
        <clients>100</clients>
        <sources>2</sources>
        <workers>1</workers>
    </limits>

    <authentication>
        <source-password>hackme</source-password>
        <relay-password>hackme</relay-password>
        <admin-user>admin</admin-user>
        <admin-password>hackme</admin-password>
    </authentication>

    <hostname>localhost</hostname>

    <listen-socket>
        <port>8000</port>
    </listen-socket>

    <fileserve>1</fileserve>

    <paths>
        <basedir>/usr/share/icecast2</basedir>
        <logdir>/var/log/icecast2</logdir>
        <webroot>/usr/share/icecast2/web</webroot>
        <adminroot>/usr/share/icecast2/admin</adminroot>
        <alias source="/" destination="/status.xsl"/>
    </paths>

    <logging>
        <accesslog>access.log</accesslog>
        <errorlog>error.log</errorlog>
        <loglevel>3</loglevel>
    </logging>
</icecast>
EOF
```

### Étape 4: Créer le Script Liquidsoap

```bash
cat > liquidsoap/radio.liq << 'EOF'
#!/usr/bin/liquidsoap

# Configuration
set("log.file.path", "/tmp/liquidsoap.log")
set("server.telnet", true)
set("server.telnet.port", 1234)

# Source principale: Playlists en rotation
main_playlist = playlist(
  mode="randomize",
  reload=300,
  "/playlists"
)

# Source de prédications programmées (horaires fixes)
scheduled_predications = playlist(
  mode="normal",
  "/uploads"
)

# Entrée LIVE depuis BUTT (input harbor pour recevoir le flux)
live_input = input.harbor(
  "live",
  port=8001,
  password="kambove2024"
)

# Switch automatique: LIVE en priorité, sinon programmation, sinon playlist
radio = fallback(
  track_sensitive=false,
  [live_input, scheduled_predications, main_playlist]
)

# Normalisation audio
radio = normalize(radio, gain_max=3., gain_min=-3.)

# Ajouter les métadonnées
radio = map_metadata(
  update=true,
  insert_missing=true,
  fun (m) -> [("station", "Radio Kambove Tabernacle")],
  radio
)

# Sortie vers Icecast local
output.icecast(
  %mp3(bitrate=192),
  host="icecast",
  port=8000,
  password="hackme",
  mount="radio.mp3",
  name="Radio Kambove Tabernacle",
  description="Webradio Chrétienne",
  genre="Gospel",
  url="http://kambove-tabernacle.radio",
  radio
)

# Sortie vers Zeno.fm (à configurer avec votre URL de montage Zeno)
# Décommentez et ajustez avec vos identifiants Zeno.fm
# output.icecast(
#   %mp3(bitrate=192),
#   host="stream.zeno.fm",
#   port=443,
#   password="VOTRE_PASSWORD_ZENO",
#   mount="VOTRE_STREAM_ID",
#   name="Radio Kambove Tabernacle",
#   radio
# )
EOF

chmod +x liquidsoap/radio.liq
```

### Étape 5: Créer des Playlists de Test

```bash
# Créer un fichier playlist de test
cat > playlists/main.m3u << 'EOF'
#EXTM3U
#EXTINF:180,Test - Silence (à remplacer)
/uploads/test.mp3
EOF

# Note: Vous devrez uploader vos vrais fichiers audio via l'interface web
```

### Étape 6: Lancer les Services

```bash
cd /home/votre-user/radio-kambove

# Construire et démarrer tous les services
docker-compose up -d

# Vérifier que tout tourne
docker-compose ps

# Voir les logs
docker-compose logs -f
```

### Étape 7: Configuration BUTT (Pour les Directs)

Sur votre machine locale où vous diffusez en direct:

1. Téléchargez BUTT: https://danielnoethen.de/butt/
2. Configuration:
   - **Server**: `votre-serveur-ip`
   - **Port**: `8001`
   - **Password**: `kambove2024`
   - **Mountpoint**: `/live`
   - **Type**: Icecast
   - **Format**: MP3, 192 kbps

## 📱 Accès à l'Interface

- **Interface Web**: http://votre-serveur-ip
- **Identifiants par défaut**: 
  - Username: `admin`
  - Password: `admin123`
  
- **Icecast Admin**: http://votre-serveur-ip:8000/admin
  - Username: `admin`
  - Password: `hackme`

- **Stream Audio**: http://votre-serveur-ip:8000/radio.mp3

## 🔧 Configuration Zeno.fm

1. Connectez-vous à votre compte Zeno.fm
2. Allez dans Settings → Broadcasting
3. Notez vos identifiants de stream
4. Modifiez `liquidsoap/radio.liq` et décommentez la section Zeno.fm
5. Remplacez avec vos identifiants
6. Redémarrez: `docker-compose restart liquidsoap`

## 🛠️ Utilisation via Portainer

1. Ouvrez Portainer: http://votre-serveur-ip:9000
2. Allez dans "Stacks"
3. Cliquez "Add stack"
4. Nom: `radio-kambove`
5. Méthode: "Upload"
6. Uploadez le `docker-compose.yml`
7. Cliquez "Deploy"

## 📊 Fonctionnalités Disponibles

### ✅ Gestion des Playlists
- Créer/modifier des playlists
- Ajouter des chansons
- Réorganiser l'ordre
- Activer/désactiver des playlists

### ✅ Programmation Horaire
- Planifier des prédications à heures fixes
- Répétition par jour de la semaine
- Gestion des événements spéciaux

### ✅ Upload de Fichiers Audio
- Upload MP3, WAV, FLAC, OGG, M4A
- Conversion automatique en MP3
- Extraction automatique des métadonnées
- Gestion des titres/artistes/albums

### ✅ Statistiques en Temps Réel
- Nombre d'auditeurs actuels
- Historique d'écoute
- Titres les plus populaires
- Graphiques de connexion

### ✅ Système d'Authentification
- Rôles Admin et Opérateur
- Sécurisation des routes
- Gestion des utilisateurs

### ✅ Diffusion Live
- Réception flux BUTT
- Priorité automatique au live
- Retour automatique aux playlists

## 🔐 Sécurité

### Changement des Mots de Passe

**1. Base de données (recommandé):**
```bash
# Éditer docker-compose.yml
nano docker-compose.yml

# Modifier les variables d'environnement:
# POSTGRES_PASSWORD
# DB_PASSWORD
# JWT_SECRET
```

**2. Icecast:**
```bash
nano icecast/icecast.xml
# Modifier source-password, admin-password
```

**3. BUTT/Live:**
```bash
nano liquidsoap/radio.liq
# Modifier le password de input.harbor
```

**Redémarrer après les modifications:**
```bash
docker-compose down
docker-compose up -d
```

## 📞 Dépannage

### Les services ne démarrent pas
```bash
# Vérifier les logs
docker-compose logs

# Reconstruire
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Pas de son dans le stream
```bash
# Vérifier Liquidsoap
docker-compose logs liquidsoap

# Vérifier Icecast
curl http://localhost:8000/radio.mp3
```

### Problème d'upload
```bash
# Vérifier les permissions
sudo chown -R 1000:1000 /home/votre-user/radio-kambove/backend/uploads
```

### Base de données inaccessible
```bash
# Recréer la base de données
docker-compose down -v
docker-compose up -d
```

## 🔄 Mise à Jour

```bash
cd /home/votre-user/radio-kambove

# Arrêter les services
docker-compose down

# Récupérer les nouveaux fichiers (depuis votre machine locale)
scp -r dist/ votre-user@votre-serveur-ip:/home/votre-user/radio-kambove/web/
scp -r backend/ votre-user@votre-serveur-ip:/home/votre-user/radio-kambove/

# Redémarrer
docker-compose up -d --build
```

## 📈 Monitoring

```bash
# Voir l'utilisation des ressources
docker stats

# Logs en temps réel
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f api
docker-compose logs -f liquidsoap
```

## 🎯 Bonnes Pratiques

1. **Backups réguliers**
   ```bash
   # Backup de la base de données
   docker exec radio_postgres pg_dump -U radio radio_kambove > backup_$(date +%Y%m%d).sql
   
   # Backup des uploads
   tar czf uploads_backup_$(date +%Y%m%d).tar.gz backend/uploads/
   ```

2. **Surveillance des logs**
   - Vérifier régulièrement les logs Liquidsoap
   - Surveiller les erreurs Icecast
   - Monitorer l'espace disque

3. **Mises à jour système**
   ```bash
   sudo apt update && sudo apt upgrade
   docker system prune -a
   ```

4. **SSL/HTTPS** (optionnel mais recommandé)
   ```bash
   # Installer Certbot
   sudo apt install certbot python3-certbot-nginx
   
   # Obtenir un certificat SSL
   sudo certbot --nginx -d votre-domaine.com
   ```

## 🙏 Support

Pour toute question ou problème, vérifiez:
1. Les logs Docker
2. Les permissions des fichiers
3. La connectivité réseau
4. L'espace disque disponible

---

**Radio Kambove Tabernacle** - Que la parole de Dieu rayonne 24/7 🙏📻
