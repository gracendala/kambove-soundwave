# Déploiement sur Ubuntu avec Docker

## 1. Prérequis installés
- ✅ Docker et Docker Compose
- ✅ Node.js 20.x et npm
- ✅ Git

## 2. Frontend compilé
```bash
cd /home/kambove-soundwave
npm install
npm run build
```

## 3. Configuration Backend
Créer le fichier `.env` dans le dossier `backend/`:

```bash
cd /home/kambove-soundwave/backend
nano .env
```

Contenu du fichier `.env`:
```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=radio_kambove
DB_USER=radio
DB_PASSWORD=CHANGEZ_MOI_EN_PRODUCTION
JWT_SECRET=CHANGEZ_CE_SECRET_TRES_SECURISE
PORT=3000
```

## 4. Créer les dossiers nécessaires
```bash
cd /home/kambove-soundwave
mkdir -p backend/uploads
mkdir -p playlists
chmod 777 backend/uploads
chmod 777 playlists
```

## 5. Lancer tous les services
```bash
cd /home/kambove-soundwave
sudo docker-compose up -d
```

## 6. Vérifier que tout fonctionne
```bash
# Voir l'état des conteneurs
sudo docker-compose ps

# Voir les logs
sudo docker-compose logs -f api

# Vérifier la base de données
sudo docker-compose exec postgres psql -U radio -d radio_kambove -c "\dt"
```

## 7. Accès à l'application

- **Interface Web**: `http://VOTRE_IP`
- **API**: `http://VOTRE_IP:3000`
- **Stream Audio**: `http://VOTRE_IP:8000/radio`
- **Icecast Admin**: `http://VOTRE_IP:8000/admin` (admin/hackme)

### Identifiants par défaut
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Changez ces mots de passe en production!

## 8. Sécurité Production

1. **Changez les mots de passe dans `docker-compose.yml`**:
   - `POSTGRES_PASSWORD`
   - `DB_PASSWORD`
   - `JWT_SECRET`

2. **Changez les mots de passe dans `icecast/icecast.xml`**:
   - `source-password`
   - `relay-password`
   - `admin-password`

3. **Changez le mot de passe admin** dans l'interface web après la première connexion

4. **Configurez SSL/HTTPS** avec un reverse proxy (nginx, Caddy)

## Commandes utiles

```bash
# Arrêter tous les services
sudo docker-compose down

# Redémarrer tous les services
sudo docker-compose restart

# Voir les logs d'un service spécifique
sudo docker-compose logs -f [service]  # api, postgres, icecast, liquidsoap, web

# Reconstruire et relancer
sudo docker-compose up -d --build

# Nettoyer complètement
sudo docker-compose down -v
```

## Résolution de problèmes

### Les services ne démarrent pas
```bash
sudo docker-compose logs -f
```

### Pas de son dans le stream
```bash
# Vérifier Liquidsoap
sudo docker-compose logs -f liquidsoap

# Vérifier qu'il y a des fichiers audio
ls -la backend/uploads/
ls -la playlists/
```

### Erreur de connexion à la base de données
```bash
# Vérifier que postgres est démarré
sudo docker-compose ps postgres

# Se connecter à la base
sudo docker-compose exec postgres psql -U radio -d radio_kambove
```

### Problème d'upload de fichiers
```bash
# Vérifier les permissions
sudo chmod 777 backend/uploads
```
