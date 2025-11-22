import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Radio, Link as LinkIcon, Settings, Save, ArrowRight, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const streamSettingsSchema = z.object({
  zeno_server: z.string().max(500),
  zeno_port: z.string().regex(/^\d+$/, "Port invalide").max(5),
  zeno_mount_point: z.string().max(200),
  zeno_password: z.string().max(200),
  butt_port: z.string().regex(/^\d+$/, "Port invalide").max(5),
  butt_password: z.string().max(100),
  butt_mount_point: z.string().max(100),
  audio_bitrate: z.string().regex(/^\d+$/, "Bitrate invalide").max(5),
  audio_samplerate: z.string().regex(/^\d+$/, "Sample rate invalide").max(10)
});

export const StreamSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [metadataEnabled, setMetadataEnabled] = useState(true);
  const [settings, setSettings] = useState({
    zeno_server: '',
    zeno_port: '8000',
    zeno_mount_point: '',
    zeno_password: '',
    butt_port: '8000',
    butt_password: '',
    butt_mount_point: '/live',
    audio_bitrate: '128',
    audio_samplerate: '44100'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('radio_settings')
        .select('setting_key, setting_value')
        .in('setting_key', Object.keys(settings).concat(['zeno_metadata_enabled']));

      if (error) throw error;

      const settingsMap: any = {};
      data?.forEach(item => {
        settingsMap[item.setting_key] = item.setting_value || '';
      });

      setSettings({
        zeno_server: settingsMap.zeno_server || '',
        zeno_port: settingsMap.zeno_port || '8000',
        zeno_mount_point: settingsMap.zeno_mount_point || '',
        zeno_password: settingsMap.zeno_password || '',
        butt_port: settingsMap.butt_port || '8000',
        butt_password: settingsMap.butt_password || '',
        butt_mount_point: settingsMap.butt_mount_point || '/live',
        audio_bitrate: settingsMap.audio_bitrate || '128',
        audio_samplerate: settingsMap.audio_samplerate || '44100'
      });

      setMetadataEnabled(settingsMap.zeno_metadata_enabled === 'true');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de charger les paramètres"
      });
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      // Validation
      streamSettingsSchema.parse(settings);

      const { data: { user } } = await supabase.auth.getUser();

      // Mise à jour de tous les paramètres
      const allSettings = {
        ...settings,
        zeno_metadata_enabled: metadataEnabled.toString()
      };

      for (const [key, value] of Object.entries(allSettings)) {
        const { error } = await supabase
          .from('radio_settings')
          .update({
            setting_value: value,
            updated_by: user?.id
          })
          .eq('setting_key', key);

        if (error) throw error;
      }

      toast({
        title: "Paramètres sauvegardés",
        description: "Vos configurations de streaming ont été mises à jour."
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Erreur de validation",
          description: error.issues[0].message
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error.message || "Impossible de sauvegarder"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Configuration du Streaming</h3>
        <p className="text-muted-foreground">Gérez vos flux d'entrée (BUTT) et de sortie (Zeno.fm)</p>
      </div>

      {/* Architecture Diagram */}
      <Card className="bg-accent/5 border-accent/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-primary/10 rounded-lg">
                <LinkIcon className="h-6 w-6 text-primary" />
              </div>
              <span className="font-semibold">BUTT (Direct)</span>
            </div>
            <ArrowRight className="h-5 w-5 text-accent" />
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Radio className="h-6 w-6 text-accent" />
              </div>
              <span className="font-semibold">Votre Serveur</span>
            </div>
            <ArrowRight className="h-5 w-5 text-accent" />
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Radio className="h-6 w-6 text-green-500" />
              </div>
              <span className="font-semibold">Zeno.fm</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BUTT Input Configuration */}
      <Card className="transition-smooth hover:shadow-divine hover:border-accent/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5 text-accent" />
            <CardTitle>Réception BUTT (Entrée)</CardTitle>
          </div>
          <CardDescription>
            BUTT envoie son flux vers votre serveur pour les directs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="butt-port">Port d'Écoute</Label>
            <Input
              id="butt-port"
              type="number"
              value={settings.butt_port}
              onChange={(e) => setSettings({ ...settings, butt_port: e.target.value })}
              placeholder="8000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="butt-password">Mot de Passe Source</Label>
            <Input
              id="butt-password"
              type="password"
              value={settings.butt_password}
              onChange={(e) => setSettings({ ...settings, butt_password: e.target.value })}
              placeholder="Mot de passe pour BUTT"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="butt-mount">Point de Montage</Label>
            <Input
              id="butt-mount"
              value={settings.butt_mount_point}
              onChange={(e) => setSettings({ ...settings, butt_mount_point: e.target.value })}
              placeholder="/live"
            />
          </div>
          <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Configuration BUTT:</strong>
            </p>
            <code className="text-xs bg-card p-2 rounded block">
              Serveur: votre-serveur.com<br/>
              Port: {settings.butt_port}<br/>
              Mot de passe: [voir ci-dessus]<br/>
              Point de montage: {settings.butt_mount_point}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Zeno.fm Output Configuration */}
      <Card className="gradient-divine border-accent/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-accent" />
            <CardTitle>Connexion Zeno.fm (Sortie)</CardTitle>
          </div>
          <CardDescription>Votre serveur diffuse vers Zeno.fm pour les auditeurs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="zeno-server">Serveur Zeno.fm</Label>
            <Input
              id="zeno-server"
              value={settings.zeno_server}
              onChange={(e) => setSettings({ ...settings, zeno_server: e.target.value })}
              placeholder="stream.zeno.fm ou relay.zeno.fm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zeno-port">Port Zeno.fm</Label>
            <Input
              id="zeno-port"
              type="number"
              value={settings.zeno_port}
              onChange={(e) => setSettings({ ...settings, zeno_port: e.target.value })}
              placeholder="8000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zeno-mount">Point de Montage Zeno.fm</Label>
            <Input
              id="zeno-mount"
              value={settings.zeno_mount_point}
              onChange={(e) => setSettings({ ...settings, zeno_mount_point: e.target.value })}
              placeholder="/live ou votre mount point"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zeno-password">Mot de Passe Zeno.fm</Label>
            <Input
              id="zeno-password"
              type="password"
              value={settings.zeno_password}
              onChange={(e) => setSettings({ ...settings, zeno_password: e.target.value })}
              placeholder="Mot de passe fourni par Zeno.fm"
            />
          </div>
          <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Configuration Liquidsoap pour Zeno.fm:</strong>
            </p>
            <code className="text-xs bg-card p-2 rounded block">
              Serveur: {settings.zeno_server || 'stream.zeno.fm'}<br/>
              Port: {settings.zeno_port}<br/>
              Mount: {settings.zeno_mount_point || '/live'}<br/>
              Password: [voir ci-dessus]
            </code>
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
              value={settings.audio_bitrate}
              onChange={(e) => setSettings({ ...settings, audio_bitrate: e.target.value })}
              placeholder="128"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="samplerate">Fréquence d'Échantillonnage (Hz)</Label>
            <Input
              id="samplerate"
              type="number"
              value={settings.audio_samplerate}
              onChange={(e) => setSettings({ ...settings, audio_samplerate: e.target.value })}
              placeholder="44100"
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSaveSettings} disabled={loading} className="w-full sm:w-auto gap-2" size="lg">
        <Save className="h-4 w-4" />
        Sauvegarder les Paramètres
      </Button>
    </div>
  );
};
