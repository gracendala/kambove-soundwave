import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Radio, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const generalSettingsSchema = z.object({
  radio_name: z.string().min(3, "Minimum 3 caractères").max(100),
  radio_description: z.string().max(500, "Maximum 500 caractères")
});

export const GeneralSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    radio_name: '',
    radio_description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('radio_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['radio_name', 'radio_description']);

      if (error) throw error;

      const settingsMap: any = {};
      data?.forEach(item => {
        settingsMap[item.setting_key] = item.setting_value || '';
      });

      setSettings({
        radio_name: settingsMap.radio_name || '',
        radio_description: settingsMap.radio_description || ''
      });
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
      generalSettingsSchema.parse(settings);

      const { data: { user } } = await supabase.auth.getUser();

      // Mise à jour de chaque paramètre
      for (const [key, value] of Object.entries(settings)) {
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
        description: "Les paramètres généraux ont été mis à jour"
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Erreur de validation",
          description: error.errors[0].message
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error.message || "Impossible de sauvegarder les paramètres"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Paramètres Généraux</h3>
        <p className="text-muted-foreground">Personnalisez votre station de radio</p>
      </div>

      <Card className="gradient-divine border-accent/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-accent" />
            <CardTitle>Informations de la Radio</CardTitle>
          </div>
          <CardDescription>Nom et description de votre station</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="radio_name">Nom de la Radio</Label>
            <Input
              id="radio_name"
              value={settings.radio_name}
              onChange={(e) => setSettings({ ...settings, radio_name: e.target.value })}
              placeholder="Radio Kambove Tabernacle"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="radio_description">Description</Label>
            <Textarea
              id="radio_description"
              value={settings.radio_description}
              onChange={(e) => setSettings({ ...settings, radio_description: e.target.value })}
              placeholder="La parole de Dieu 24/7"
              rows={3}
            />
          </div>
          <Button onClick={handleSaveSettings} disabled={loading} className="w-full sm:w-auto gap-2">
            <Save className="h-4 w-4" />
            Sauvegarder les Paramètres
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
