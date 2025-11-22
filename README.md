# 🎵 Radio Kambove Tabernacle - Système de Gestion Webradio

Interface web complète pour gérer une webradio 24/7 diffusant vers Zeno.fm, avec gestion de playlists, programmation horaire, upload audio, statistiques en temps réel et support de diffusion live via BUTT.

## ✨ Fonctionnalités

- 🎼 **Gestion de Playlists** - Créez et gérez vos playlists musicales
- ⏰ **Programmation Horaire** - Planifiez automatiquement vos prédications
- 📤 **Upload Audio** - Téléchargez et convertissez vos fichiers audio (MP3, WAV, FLAC, OGG, M4A)
- 📊 **Statistiques Temps Réel** - Suivez vos auditeurs et les titres populaires via WebSocket
- 🎙️ **Diffusion Live** - Intégration BUTT pour vos directs de prédication
- 🔐 **Authentification Multi-Rôles** - Admin et Opérateur
- 📱 **PWA** - Utilisable sur mobile et desktop, installation possible
- 🌙 **Design Spirituel** - Interface adaptée à l'église Kambove Tabernacle

## 🚀 Déploiement

👉 **Consultez le [Guide de Déploiement Complet](./DEPLOYMENT.md)** pour installer le système sur votre serveur Ubuntu avec Docker.

## 🛠️ Architecture Technique

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + PostgreSQL
- **Streaming**: Liquidsoap + Icecast
- **WebSocket**: Stats en temps réel
- **Containerisation**: Docker + Docker Compose
- **Gestion**: Portainer

## 📋 Prérequis

- Ubuntu Server avec Docker et Portainer
- Minimum 2GB RAM, 20GB disque
- Ports: 80, 3000, 8000

## 🔑 Identifiants par Défaut

- **Interface Web**: `admin` / `admin123`
- **Icecast Admin**: `admin` / `hackme`

⚠️ **Changez ces identifiants en production !**

## 📖 Documentation

- [Guide de Déploiement](./DEPLOYMENT.md)
- [Configuration Zeno.fm](./DEPLOYMENT.md#-configuration-zenofm)
- [Configuration BUTT](./DEPLOYMENT.md#étape-7-configuration-butt-pour-les-directs)
- [Dépannage](./DEPLOYMENT.md#-dépannage)

## 🎯 Accès Rapide

Après déploiement:
- **Interface**: http://votre-serveur-ip
- **Stream**: http://votre-serveur-ip:8000/radio.mp3
- **Icecast**: http://votre-serveur-ip:8000/admin

## 🙏 À Propos

Développé pour l'église **Kambove Tabernacle** - Pour que la parole de Dieu rayonne 24/7 📻

---

## Project info

**URL**: https://lovable.dev/projects/c9ed2a7e-065b-458b-a529-a09364f5a52f

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c9ed2a7e-065b-458b-a529-a09364f5a52f) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c9ed2a7e-065b-458b-a529-a09364f5a52f) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
