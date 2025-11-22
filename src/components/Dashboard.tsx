import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Radio, Music, Calendar, Users, Play, Pause, Volume2, AlertCircle, BarChart3, Activity, TrendingUp } from "lucide-react";
import { useState } from "react";
import { isDemoMode } from "@/lib/mockApi";

export const Dashboard = () => {
  const [isLive, setIsLive] = useState(true);
  const [currentTrack] = useState({
    title: "Amazing Grace",
    artist: "Chœur de Kambove Tabernacle",
    duration: "3:45"
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Mode Démo Alert */}
      {isDemoMode() && (
        <Alert className="bg-primary/10 border-primary/30">
          <AlertCircle className="h-5 w-5 text-primary" />
          <AlertDescription className="ml-2">
            <strong className="text-primary">Mode Démo Actif</strong> - Vous testez l'interface avec des données fictives.
            Pour activer toutes les fonctionnalités, déployez le système sur votre serveur Ubuntu en suivant le{' '}
            <a href="https://github.com/votre-repo/DEPLOYMENT.md" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
              Guide de Déploiement
            </a>.
          </AlertDescription>
        </Alert>
      )}

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
          {/* Current Track Card */}
          <Card variant="elevated" className="gradient-divine">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5 text-accent" />
                Lecture en Cours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/30">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Music className="h-8 w-8 text-accent animate-pulse" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-foreground">{currentTrack.title}</p>
                    <p className="text-sm text-muted-foreground">{currentTrack.artist}</p>
                    <p className="text-xs text-muted-foreground mt-1">Durée: {currentTrack.duration}</p>
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
                <CardTitle className="text-sm font-medium">Auditeurs Actuels</CardTitle>
                <Users className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">247</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% vs hier
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated" className="hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Playlists Actives</CardTitle>
                <Music className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">12</div>
                <p className="text-xs text-muted-foreground">+2 depuis hier</p>
              </CardContent>
            </Card>

            <Card variant="elevated" className="hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Programmes</CardTitle>
                <Calendar className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">8</div>
                <p className="text-xs text-muted-foreground">Cette semaine</p>
              </CardContent>
            </Card>

            <Card variant="elevated" className="hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Activity className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">99.8%</div>
                <p className="text-xs text-muted-foreground">30 derniers jours</p>
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
                  <span className="text-lg font-bold text-accent">1,247</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Cette semaine</span>
                  <span className="text-lg font-bold text-accent">8,956</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Ce mois</span>
                  <span className="text-lg font-bold text-accent">34,521</span>
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
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="h-8 w-8 rounded bg-accent/20 flex items-center justify-center text-accent font-bold">1</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Amazing Grace</p>
                    <p className="text-xs text-muted-foreground">2,845 écoutes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="h-8 w-8 rounded bg-accent/20 flex items-center justify-center text-accent font-bold">2</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Prédication du Dimanche</p>
                    <p className="text-xs text-muted-foreground">1,923 écoutes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="h-8 w-8 rounded bg-accent/20 flex items-center justify-center text-accent font-bold">3</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Chant de Louange</p>
                    <p className="text-xs text-muted-foreground">1,654 écoutes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Controls Tab */}
        <TabsContent value="controls" className="space-y-6 animate-in fade-in duration-300">
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
                    <p className="text-2xl font-bold text-accent">24/7</p>
                    <p className="text-xs text-muted-foreground">Diffusion</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-accent">128kbps</p>
                    <p className="text-xs text-muted-foreground">Qualité</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-accent">0ms</p>
                    <p className="text-xs text-muted-foreground">Latence</p>
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
