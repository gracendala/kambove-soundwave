import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Radio, Music, Calendar, Users, Play, Pause, Volume2, BarChart3, Activity, TrendingUp, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { playlistsAPI, songsAPI, scheduleAPI, statsAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import LiveStreamPlayer from "@/components/LiveStreamPlayer";

interface DashboardStats {
  totalPlaylists: number;
  totalSongs: number;
  upcomingEvents: number;
  currentListeners: number;
  topSongs: Array<{
    id: string;
    title: string;
    artist: string;
    playCount: number;
  }>;
  playsToday: number;
  playsThisWeek: number;
  playsThisMonth: number;
  streamQuality: string;
}

export const Dashboard = () => {
  const [isLive, setIsLive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalPlaylists: 0,
    totalSongs: 0,
    upcomingEvents: 0,
    currentListeners: 0,
    topSongs: [],
    playsToday: 0,
    playsThisWeek: 0,
    playsThisMonth: 0,
    streamQuality: '128kbps'
  });
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get data from backend API
      const [playlistsData, songsData, eventsData, statsData] = await Promise.all([
        playlistsAPI.getAll(),
        songsAPI.getAll(),
        scheduleAPI.getAll(),
        statsAPI.getCurrent().catch(() => ({ listeners: 0, currentSong: null }))
      ]);

      // Calculate upcoming events
      const today = new Date();
      const upcomingEvents = eventsData.filter((event: any) => {
        if (event.event_type === 'recurring') return true;
        const eventDate = new Date(event.scheduled_date);
        return eventDate >= today;
      });

      // Mock stats for now (can be enhanced with real backend stats)
      setStats({
        totalPlaylists: playlistsData.length || 0,
        totalSongs: songsData.length || 0,
        upcomingEvents: upcomingEvents.length || 0,
        currentListeners: statsData.listeners || 0,
        topSongs: [],
        playsToday: 0,
        playsThisWeek: 0,
        playsThisMonth: 0,
        streamQuality: '128kbps'
      });
    } catch (error: any) {
      console.error('Dashboard load error:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de charger les données"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-border/40">
        <div className="h-12 w-12 rounded-xl bg-gradient-divine flex items-center justify-center shadow-divine">
          <Radio className="h-6 w-6 text-background" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord</h1>
          <p className="text-sm text-muted-foreground">Gestion de la diffusion radio</p>
        </div>
        <Badge variant={isLive ? "default" : "secondary"} className="ml-auto text-sm px-4 py-1.5">
          {isLive ? "🔴 En Direct" : "⚫ Hors Ligne"}
        </Badge>
      </div>
      
      {/* Tabs Navigation */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="h-4 w-4" />
            Aperçu
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistiques
          </TabsTrigger>
          <TabsTrigger value="controls" className="gap-2">
            <Radio className="h-4 w-4" />
            Contrôles
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-300">
          {/* Info Card */}
          <Card variant="elevated" className="gradient-divine">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-accent" />
                Statut de la Radio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/30">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Radio className="h-8 w-8 text-accent animate-pulse" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-foreground">Radio Kambove Tabernacle</p>
                    <p className="text-sm text-muted-foreground">Diffusion en continu</p>
                    <p className="text-xs text-muted-foreground mt-1">{stats.totalSongs} fichiers audio</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" onClick={() => setIsLive(!isLive)} className="h-10 w-10">
                    {isLive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  <Button size="icon" variant="outline" className="h-10 w-10">
                    <Volume2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card variant="elevated" className="hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Auditeurs</CardTitle>
                <Users className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{stats.currentListeners}</div>
                <p className="text-xs text-muted-foreground">Dernière écoute</p>
              </CardContent>
            </Card>

            <Card variant="elevated" className="hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Playlists</CardTitle>
                <Music className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{stats.totalPlaylists}</div>
                <p className="text-xs text-muted-foreground">Total créées</p>
              </CardContent>
            </Card>

            <Card variant="elevated" className="hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Programmes</CardTitle>
                <Calendar className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{stats.upcomingEvents}</div>
                <p className="text-xs text-muted-foreground">À venir</p>
              </CardContent>
            </Card>

            <Card variant="elevated" className="hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fichiers Audio</CardTitle>
                <Activity className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{stats.totalSongs}</div>
                <p className="text-xs text-muted-foreground">Dans la bibliothèque</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6 animate-in fade-in duration-300">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-accent" />
                  Statistiques d'Écoute
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Aujourd'hui</span>
                  <span className="text-lg font-bold text-accent">{stats.playsToday.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Cette semaine</span>
                  <span className="text-lg font-bold text-accent">{stats.playsThisWeek.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Ce mois</span>
                  <span className="text-lg font-bold text-accent">{stats.playsThisMonth.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Top Contenus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.topSongs.length > 0 ? (
                  stats.topSongs.map((song, index) => (
                    <div key={song.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="h-8 w-8 rounded bg-accent/20 flex items-center justify-center text-accent font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{song.title}</p>
                        <p className="text-xs text-muted-foreground">{song.playCount} écoute{song.playCount > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Music className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Aucune statistique disponible</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Controls Tab */}
        <TabsContent value="controls" className="space-y-6 animate-in fade-in duration-300">
          <LiveStreamPlayer />
          
          <Card variant="elevated" className="gradient-divine">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-accent" />
                Contrôles de Diffusion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  size="lg" 
                  variant={isLive ? "destructive" : "default"}
                  onClick={() => setIsLive(!isLive)}
                  className="h-16 text-lg font-semibold"
                >
                  {isLive ? (
                    <>
                      <Pause className="h-5 w-5 mr-2" />
                      Arrêter la Diffusion
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Démarrer la Diffusion
                    </>
                  )}
                </Button>
                <Button size="lg" variant="outline" className="h-16">
                  <Volume2 className="h-5 w-5 mr-2" />
                  Régler le Volume
                </Button>
              </div>

              <div className="p-4 bg-background/50 rounded-lg border border-border/30 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  État du Système
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-accent">{isLive ? '🔴 Live' : '⚫ Off'}</p>
                    <p className="text-xs text-muted-foreground">Diffusion</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-accent">{stats.streamQuality}</p>
                    <p className="text-xs text-muted-foreground">Qualité</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-accent">{stats.currentListeners}</p>
                    <p className="text-xs text-muted-foreground">Auditeurs</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
