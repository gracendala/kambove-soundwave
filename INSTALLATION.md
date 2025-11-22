# Guide d'Installation Local - Radio Kambove Tabernacle

## 📥 Téléchargement du Projet

### Option 1 : Via GitHub (Recommandé)
1. Cliquez sur le bouton **GitHub** en haut à droite de Lovable
2. Exportez le projet vers votre compte GitHub
3. Clonez le dépôt sur votre machine locale :
```bash
git clone https://github.com/votre-compte/radio-kambove.git
cd radio-kambove
```

### Option 2 : Téléchargement Direct
1. Cliquez sur **⋮** (menu) > **Download project**
2. Extrayez le fichier ZIP sur votre machine
3. Ouvrez un terminal dans le dossier extrait

## 🚀 Déploiement avec Docker

### Prérequis
- Docker et Docker Compose installés
- Minimum 2 Go RAM disponible
- Ports 80, 3000, 8000 disponibles

### Étapes de Déploiement

1. **Configuration du Backend**
```bash
cd backend
cp .env.example .env
nano .env  # Modifiez les variables si nécessaire
```

Variables importantes dans `.env` :
```env
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=radio_kambove
DB_USER=radio
DB_PASSWORD=CHANGEZ_MOI_ICI
JWT_SECRET=CHANGEZ_CE_SECRET_SUPER_SECURISE
```

2. **Construction du Frontend**
```bash
cd ..  # Retour à la racine
npm install
npm run build
```

Cela créera le dossier `dist/` avec les fichiers statiques.

3. **Démarrage des Services Docker**
```bash
docker-compose up -d
```

Vérification :
```bash
docker-compose ps  # Voir l'état des services
docker-compose logs -f api  # Voir les logs de l'API
```

4. **Accès à l'Application**
- Interface Web : `http://localhost` ou `http://votre-ip`
- API Backend : `http://localhost:3000`
- Icecast Admin : `http://localhost:8000/admin`
- Stream Audio : `http://localhost:8000/radio.mp3`

### Identifiants par Défaut

**Interface Web :**
- Username : `admin`
- Password : `admin123`

**Icecast Admin :**
- Username : `admin`
- Password : Voir `icecast/icecast.xml`

## 🔧 Configuration Icecast

Créez le fichier `icecast/icecast.xml` :
```xml
<icecast>
    <limits>
        <clients>100</clients>
        <sources>2</sources>
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
    <paths>
        <basedir>/usr/share/icecast2</basedir>
        <logdir>/var/log/icecast2</logdir>
        <webroot>/usr/share/icecast2/web</webroot>
        <adminroot>/usr/share/icecast2/admin</adminroot>
    </paths>
    <logging>
        <accesslog>access.log</accesslog>
        <errorlog>error.log</errorlog>
        <loglevel>3</loglevel>
    </logging>
</icecast>
```

## 🎵 Configuration Liquidsoap

Créez le fichier `liquidsoap/radio.liq` :
```liquidsoap
#!/usr/bin/liquidsoap

# Configuration
set("log.file.path", "/var/log/liquidsoap/radio.log")
set("server.telnet", true)
set("server.telnet.port", 1234)

# Playlists
playlist_principale = playlist(
    mode="randomize",
    reload_mode="watch",
    "/playlists/principale.m3u"
)

# Fallback musique par défaut
fallback = single("/uploads/default.mp3")

# Radio source
radio = fallback(track_sensitive=false, [playlist_principale, fallback])

# Normalisation audio
radio = normalize(radio)

# Streaming vers Icecast
output.icecast(
    %mp3(bitrate=128),
    host="icecast",
    port=8000,
    password="hackme",
    mount="radio.mp3",
    name="Radio Kambove Tabernacle",
    description="Radio chrétienne 24/7",
    url="http://localhost",
    radio
)
```

Créez le Dockerfile Liquidsoap `liquidsoap/Dockerfile` :
```dockerfile
FROM savonet/liquidsoap:main

RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /etc/liquidsoap

CMD ["liquidsoap", "/etc/liquidsoap/radio.liq"]
```

## 📂 Structure des Dossiers

Créez les dossiers nécessaires :
```bash
mkdir -p playlists backend/uploads
```

Créez une playlist test `playlists/principale.m3u` :
```
#EXTM3U
/uploads/chanson1.mp3
/uploads/chanson2.mp3
```

## 🔄 Commandes Utiles

```bash
# Arrêter les services
docker-compose down

# Redémarrer un service spécifique
docker-compose restart api

# Voir les logs
docker-compose logs -f [service]

# Reconstruire après modifications
docker-compose up -d --build

# Nettoyer complètement
docker-compose down -v  # Attention: supprime la base de données
```

## 🔒 Sécurité en Production

**IMPORTANT** : Avant de déployer en production :

1. **Changez tous les mots de passe** dans :
   - `backend/.env` (DB_PASSWORD, JWT_SECRET)
   - `icecast/icecast.xml` (tous les passwords)
   - `docker-compose.yml` (POSTGRES_PASSWORD)

2. **Configurez un nom de domaine et SSL/HTTPS** :
   - Utilisez Nginx avec Let's Encrypt
   - Modifiez `nginx.conf` pour HTTPS

3. **Changez le mot de passe admin** :
   - Connectez-vous avec admin/admin123
   - Allez dans Paramètres pour changer le mot de passe

## 📊 Surveillance

```bash
# Utilisation CPU/RAM
docker stats

# Logs en temps réel
docker-compose logs -f

# État de la base de données
docker-compose exec postgres psql -U radio -d radio_kambove -c "SELECT * FROM users;"
```

## 🆘 Dépannage

**Services ne démarrent pas :**
```bash
docker-compose logs [service]
```

**Pas d'audio :**
- Vérifiez que Liquidsoap est connecté à Icecast
- Vérifiez que les fichiers audio existent dans `backend/uploads/`
- Vérifiez les permissions des dossiers

**Erreurs de connexion base de données :**
- Attendez 10-15 secondes que PostgreSQL démarre
- Vérifiez les credentials dans `.env` et `docker-compose.yml`

**Impossible d'uploader des fichiers :**
- Vérifiez les permissions : `chmod 777 backend/uploads`
- Vérifiez l'espace disque disponible

## 📝 Prochaines Étapes

Une fois installé :
1. Connectez-vous avec admin/admin123
2. Changez le mot de passe admin
3. Uploadez vos premiers fichiers audio
4. Créez vos playlists
5. Programmez vos événements
6. Partagez l'URL du stream : `http://votre-ip:8000/radio.mp3`

## 📚 Documentation Complète

Voir `DEPLOYMENT.md` pour plus de détails sur la configuration avancée.
