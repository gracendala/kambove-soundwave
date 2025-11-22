# Guide de Migration vers Auto-Hébergement

## ✅ Migration Terminée

Le frontend a été migré pour utiliser votre backend Node.js Express au lieu de Lovable Cloud (Supabase).

## Architecture Actuelle

### Stack Backend (Docker)
- **PostgreSQL**: Base de données (port 5432)
- **API Node.js**: Backend Express (port 3000)
- **Icecast**: Serveur de streaming (port 8000)
- **Liquidsoap**: Automation audio
- **Nginx**: Reverse proxy et frontend (port 80)

### Frontend
- **React + Vite**: Interface web compilée
- **Authentication JWT**: Tokens stockés en localStorage
- **API Client**: Appels REST vers le backend Express

## Déploiement

### 1. Configuration de l'environnement

Créez un fichier `.env` dans le dossier frontend (racine du projet):

```env
# URL de l'API backend (laisser vide pour utiliser /api via nginx)
VITE_API_URL=
```

### 2. Build du Frontend

```bash
# Installer les dépendances
npm install

# Compiler pour la production
npm run build
```

Les fichiers compilés seront dans `dist/` et seront servis par nginx.

### 3. Lancer les Services Docker

```bash
cd /chemin/vers/projet
sudo docker-compose up -d
```

### 4. Accès à l'Application

- **Interface Web**: `http://VOTRE_IP`
- **API Backend**: `http://VOTRE_IP:3000` (ou via nginx `/api`)
- **Stream Audio**: `http://VOTRE_IP:8000/radio`
- **Icecast Admin**: `http://VOTRE_IP:8000/admin`

### Identifiants par Défaut

**Backend (à configurer dans `backend/.env`)**:
- Voir `backend/.env.example` pour la configuration

**Icecast**:
- Username: `admin`
- Password: `hackme` (à changer en production!)

## Modifications Effectuées

### 1. Service API Client (`src/services/api.ts`)
- Gestion des requêtes vers le backend Express
- Authentication JWT avec localStorage
- Endpoints: auth, playlists, songs, schedule, stats

### 2. Contexte d'Authentication (`src/contexts/AuthContext.tsx`)
- Utilise JWT au lieu de Supabase Auth
- Stockage token dans localStorage
- Décodage du token pour récupérer les infos utilisateur

### 3. Composants Mis à Jour
- `src/pages/Login.tsx`: Login/Signup via API
- `src/components/Dashboard.tsx`: Stats via API
- `src/components/PlaylistManager.tsx`: CRUD playlists via API
- `src/components/PlaylistDetail.tsx`: Gestion chansons playlist via API
- `src/components/AudioLibrary.tsx`: Upload et gestion audio via API
- `src/components/ScheduleManager.tsx`: Programmation via API

## Fichiers de Configuration

### nginx.conf
Configure le reverse proxy pour:
- Frontend statique (`/`)
- API backend (`/api`)
- WebSocket stats (`/ws`)
- Uploads (`/uploads`)

### docker-compose.yml
Orchestre tous les services:
- Base de données PostgreSQL
- API Node.js
- Icecast (streaming)
- Liquidsoap (automation)
- Nginx (frontend)

## Routes API Backend

### Authentification
- `POST /api/auth/login`: Connexion (username, password)
- `POST /api/auth/register`: Inscription

### Playlists
- `GET /api/playlists`: Liste des playlists
- `POST /api/playlists`: Créer une playlist
- `DELETE /api/playlists/:id`: Supprimer une playlist
- `GET /api/playlists/:id/songs`: Chansons d'une playlist
- `POST /api/playlists/:id/songs`: Ajouter une chanson
- `DELETE /api/playlists/:playlistId/songs/:songId`: Retirer une chanson

### Audio
- `GET /api/upload/songs`: Liste des fichiers audio
- `POST /api/upload`: Upload un fichier audio (multipart/form-data)
- `DELETE /api/upload/:id`: Supprimer un fichier audio

### Programmation
- `GET /api/schedule`: Liste des événements
- `POST /api/schedule`: Créer un événement
- `DELETE /api/schedule/:id`: Supprimer un événement

### Statistiques
- `GET /api/stats/current`: Stats actuelles
- `GET /api/stats/history`: Historique des stats

## Sécurité Production

### 1. Changer les Mots de Passe

**backend/.env**:
```env
DB_PASSWORD=votre_mot_de_passe_securise
JWT_SECRET=votre_secret_jwt_tres_complexe
```

**docker-compose.yml**:
```yaml
POSTGRES_PASSWORD: votre_mot_de_passe_securise
```

**icecast/icecast.xml**:
```xml
<source-password>votre_password</source-password>
<admin-password>votre_password</admin-password>
```

### 2. SSL/HTTPS

Utilisez un reverse proxy comme Caddy ou nginx avec Let's Encrypt:

```bash
# Exemple avec Caddy
caddy reverse-proxy --from votre-domaine.com --to localhost:80
```

### 3. Firewall

```bash
# Autoriser seulement les ports nécessaires
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8000/tcp  # Icecast
sudo ufw enable
```

## Dépannage

### Frontend ne se connecte pas à l'API

1. Vérifier que nginx est démarré:
   ```bash
   sudo docker-compose ps web
   ```

2. Vérifier les logs:
   ```bash
   sudo docker-compose logs web
   sudo docker-compose logs api
   ```

3. Vérifier la configuration nginx (`nginx.conf`)

### Erreur d'authentification

1. Vérifier le JWT_SECRET dans `backend/.env`
2. Vider le localStorage du navigateur
3. Vérifier les logs API:
   ```bash
   sudo docker-compose logs api
   ```

### Pas de son dans le stream

1. Vérifier Liquidsoap:
   ```bash
   sudo docker-compose logs liquidsoap
   ```

2. Vérifier les fichiers audio:
   ```bash
   ls -la backend/uploads/
   ls -la playlists/
   ```

3. Vérifier Icecast:
   ```bash
   sudo docker-compose logs icecast
   ```

## Commandes Utiles

```bash
# Redémarrer tous les services
sudo docker-compose restart

# Reconstruire et relancer
sudo docker-compose up -d --build

# Voir les logs en temps réel
sudo docker-compose logs -f

# Voir les logs d'un service spécifique
sudo docker-compose logs -f api

# Arrêter tous les services
sudo docker-compose down

# Nettoyer complètement (ATTENTION: supprime les données)
sudo docker-compose down -v
```

## Maintenance

### Sauvegardes

```bash
# Sauvegarder la base de données
sudo docker-compose exec postgres pg_dump -U radio radio_kambove > backup_$(date +%Y%m%d).sql

# Sauvegarder les uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz backend/uploads/
```

### Restauration

```bash
# Restaurer la base de données
sudo docker-compose exec -T postgres psql -U radio radio_kambove < backup_20250101.sql

# Restaurer les uploads
tar -xzf uploads_backup_20250101.tar.gz
```

## Support

Pour toute question ou problème:
1. Consultez les logs Docker
2. Vérifiez la configuration des services
3. Assurez-vous que tous les ports sont accessibles

## URLs de Référence

- Documentation Docker: https://docs.docker.com/
- Documentation Icecast: https://icecast.org/docs/
- Documentation Liquidsoap: https://www.liquidsoap.info/
- Documentation Nginx: https://nginx.org/en/docs/
