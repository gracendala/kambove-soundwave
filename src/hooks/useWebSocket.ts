import { useEffect, useState } from 'react';

interface StatsUpdate {
  type: 'stats_update';
  listeners: number;
  timestamp: string;
}

export function useWebSocket() {
  const [stats, setStats] = useState<StatsUpdate | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      setConnected(true);
      console.log('WebSocket connecté');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'stats_update') {
          setStats(data);
        }
      } catch (error) {
        console.error('Erreur parsing WebSocket:', error);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log('WebSocket déconnecté');
    };

    ws.onerror = (error) => {
      console.error('Erreur WebSocket:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  return { stats, connected };
}
