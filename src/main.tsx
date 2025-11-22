import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from 'virtual:pwa-register';

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Une nouvelle version est disponible. Mettre à jour ?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('L\'application est prête à fonctionner hors ligne');
  },
});

createRoot(document.getElementById("root")!).render(<App />);
