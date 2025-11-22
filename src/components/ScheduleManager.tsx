import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Trash2, Music, Power, PowerOff, Upload, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Song {
  id: string;
  title: string;
  artist?: string;
  duration?: number;
  file_path: string;
  created_at: string;
}

interface ScheduledEvent {
  id: string;
  playlist_id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: string;
}

export const ScheduleManager = () => {
  const [events, setEvents] = useState<ScheduledEvent[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [newEvent, setNewEvent] = useState({
    dayOfWeek: "",
    startTime: "",
    endTime: ""
  });

  const days = [
    { label: "Dimanche", value: 0 },
    { label: "Lundi", value: 1 },
    { label: "Mardi", value: 2 },
    { label: "Mercredi", value: 3 },
    { label: "Jeudi", value: 4 },
    { label: "Vendredi", value: 5 },
    { label: "Samedi", value: 6 }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [{ data: eventsData, error: eventsError }, { data: songsData, error: songsError }] = await Promise.all([
        supabase.from('scheduled_events').select('*').order('day_of_week'),
        supabase.from('songs').select('*').order('created_at', { ascending: false })
      ]);

      if (eventsError) throw eventsError;
      if (songsError) throw songsError;

      setEvents(eventsData || []);
      setSongs(songsData || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.dayOfWeek || !newEvent.startTime || !newEvent.endTime) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('scheduled_events')
        .insert([{
          day_of_week: parseInt(newEvent.dayOfWeek),
          start_time: newEvent.startTime,
          end_time: newEvent.endTime,
          created_by: user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Événement programmé ajouté"
      });

      setIsDialogOpen(false);
      setNewEvent({ dayOfWeek: "", startTime: "", endTime: "" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter l'événement",
        variant: "destructive"
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setUploadFile(file);
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier audio",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      // Upload file to storage
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(filePath, uploadFile);

      if (uploadError) throw uploadError;

      // Create song record
      const { error: insertError } = await supabase
        .from('songs')
        .insert([{
          title: uploadFile.name.replace(/\.[^/.]+$/, ""),
          file_path: filePath,
          file_size: uploadFile.size,
          uploaded_by: user?.id
        }]);

      if (insertError) throw insertError;

      toast({
        title: "Succès",
        description: "Fichier audio importé avec succès",
      });
      setUploadFile(null);
      loadData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'importer le fichier audio",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSong = async (id: string, filePath: string) => {
    try {
      // Delete from storage
      await supabase.storage.from('audio-files').remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Fichier audio supprimé",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le fichier audio",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Événement supprimé"
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'événement",
        variant: "destructive"
      });
    }
  };

  const getDayLabel = (dayValue: number) => {
    return days.find(d => d.value === dayValue)?.label || dayValue.toString();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="transition-smooth hover:shadow-divine hover:border-accent/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bibliothèque audio</CardTitle>
              <CardDescription>Importez vos fichiers audio pour les utiliser dans la programmation</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="sm:w-auto"
            />
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!uploadFile || uploading}
              className="sm:w-auto w-full gap-2"
            >
              {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
              <Upload className="h-4 w-4" />
              Importer un fichier audio
            </Button>
          </div>
          <div className="space-y-2">
            {songs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun fichier audio importé pour le moment.
              </p>
            ) : (
              <ScrollArea className="h-56 rounded-md border border-border/50 p-3">
                <div className="space-y-2">
                  {songs.map((song) => (
                    <div
                      key={song.id}
                      className="flex items-center justify-between rounded-lg bg-card px-3 py-2 hover:bg-muted/50 transition-smooth"
                    >
                      <div className="flex items-center gap-3">
                        <Music className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{song.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {song.artist || "Artiste inconnu"}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => handleDeleteSong(song.id, song.file_path)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Programmation Automatique</h2>
          <p className="text-muted-foreground">
            Programmez des plages horaires pour votre diffusion
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Programmer un Créneau
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Programmer un Créneau</DialogTitle>
              <DialogDescription>
                Définissez une plage horaire pour votre programmation
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="day">Jour de la Semaine</Label>
                <Select
                  value={newEvent.dayOfWeek}
                  onValueChange={(value) => setNewEvent({ ...newEvent, dayOfWeek: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un jour" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map(day => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Heure de Début</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">Heure de Fin</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                />
              </div>

              <Button onClick={handleAddEvent} className="w-full">
                Programmer le Créneau
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="gradient-divine border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Créneaux Programmés
          </CardTitle>
          <CardDescription>
            Ces créneaux définissent votre grille de programmation hebdomadaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune programmation automatique. Ajoutez-en une pour commencer.
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <Card 
                  key={event.id} 
                  className="transition-smooth hover:shadow-divine hover:border-accent/30"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-semibold">{getDayLabel(event.day_of_week)}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.start_time} - {event.end_time}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
