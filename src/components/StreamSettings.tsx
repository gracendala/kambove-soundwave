import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Radio, Settings, Upload, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const StreamSettings = () => {
  const { toast } = useToast();
  const [zenoConnected, setZenoConnected] = useState(true);
  const [buttConnected, setButtConnected] = useState(false);
  const [metadataEnabled, setMetadataEnabled] = useState(true);

  const handleSaveSettings = () => {
    toast({
      title: "Paramètres sauvegardés",
      description: "Vos configurations de streaming ont été mises à jour.",
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configuration du Streaming</h2>
        <p className="text-muted-foreground">Gérez vos connexions et paramètres de diffusion</p>
      </div>

      {/* Zeno.fm Configuration */}
      <Card className="gradient-divine border-accent/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-accent" />
              <CardTitle>Connexion Zeno.fm</CardTitle>
            </div>
            {zenoConnected && (
              <Badge className="bg-green-500 text-white gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Connecté
              </Badge>
            )}
          </div>
          <CardDescription>Configurez votre sortie de streaming vers Zeno.fm</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="zeno-url">URL de Streaming Zeno.fm</Label>
            <Input
              id="zeno-url"
              placeholder="rtmp://stream.zeno.fm/your-key"
              defaultValue="rtmp://stream.zeno.fm/kambove-tabernacle"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zeno-key">Clé de Streaming</Label>
            <Input
              id="zeno-key"
              type="password"
              placeholder="Votre clé de streaming"
              defaultValue="••••••••••••••"
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border/50">
            <div className="space-y-0.5">
              <Label>Envoi des Métadonnées</Label>
              <p className="text-sm text-muted-foreground">
                Partager le titre et l'artiste en cours de lecture
              </p>
            </div>
            <Switch
              checked={metadataEnabled}
              onCheckedChange={setMetadataEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* BUTT Configuration */}
      <Card className="transition-smooth hover:shadow-divine hover:border-accent/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-accent" />
              <CardTitle>Réception BUTT (Direct)</CardTitle>
            </div>
            {buttConnected ? (
              <Badge className="bg-green-500 text-white gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Connecté
              </Badge>
            ) : (
              <Badge variant="outline">Déconnecté</Badge>
            )}
          </div>
          <CardDescription>
            Configurez la réception de flux BUTT pour vos directs de prédication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="butt-port">Port d'Écoute</Label>
            <Input
              id="butt-port"
              type="number"
              placeholder="8000"
              defaultValue="8000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="butt-password">Mot de Passe Source</Label>
            <Input
              id="butt-password"
              type="password"
              placeholder="Mot de passe pour BUTT"
              defaultValue="••••••••"
            />
          </div>
          <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Configuration BUTT:</strong>
            </p>
            <code className="text-xs bg-card p-2 rounded block">
              Serveur: votre-serveur.com<br/>
              Port: 8000<br/>
              Mot de passe: [voir ci-dessus]<br/>
              Point de montage: /live
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Audio Quality */}
      <Card className="transition-smooth hover:shadow-divine hover:border-accent/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-accent" />
            <CardTitle>Qualité Audio</CardTitle>
          </div>
          <CardDescription>Paramètres d'encodage et de qualité</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bitrate">Bitrate (kbps)</Label>
            <Input
              id="bitrate"
              type="number"
              placeholder="128"
              defaultValue="128"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="samplerate">Fréquence d'Échantillonnage (Hz)</Label>
            <Input
              id="samplerate"
              type="number"
              placeholder="44100"
              defaultValue="44100"
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSaveSettings} className="w-full sm:w-auto" size="lg">
        <Upload className="h-4 w-4 mr-2" />
        Sauvegarder les Paramètres
      </Button>
    </div>
  );
};
