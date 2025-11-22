import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, Trash2, Music, Power, PowerOff, Upload, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Song {
  id: number;
  title: string;
  artist: string;
  duration: number;
  album?: string;
  created_at?: string;
}

interface ScheduledEvent {
  id: number;
  name: string;
  song_id: number;
  scheduled_time: string;
  days_of_week: number[];
  active: boolean;
  song_title?: string;
  artist?: string;
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
    name: "",
    songId: "",
    time: "",
    daysOfWeek: [] as number[]
  });

  const days = [
    { label: "Lundi", value: 1 },
    { label: "Mardi", value: 2 },
    { label: "Mercredi", value: 3 },
    { label: "Jeudi", value: 4 },
    { label: "Vendredi", value: 5 },
    { label: "Samedi", value: 6 },
    { label: "Dimanche", value: 0 }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, songsData] = await Promise.all([
        api.getSchedule(),
        api.getSongs()
      ]);
      setEvents(eventsData as ScheduledEvent[]);
      setSongs(songsData as Song[]);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.name || !newEvent.songId || !newEvent.time || newEvent.daysOfWeek.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    try {
      await api.createScheduledEvent({
        name: newEvent.name,
        songId: parseInt(newEvent.songId),
        scheduledTime: newEvent.time,
        daysOfWeek: newEvent.daysOfWeek
      });
      
      toast({
        title: "Succès",
        description: "Événement programmé ajouté"
      });
      
      setIsDialogOpen(false);
      setNewEvent({ name: "", songId: "", time: "", daysOfWeek: [] });
      loadData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'événement",
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
      await api.uploadAudio(uploadFile);
      toast({
        title: "Succès",
        description: "Fichier audio importé avec succès",
      });
      setUploadFile(null);
      loadData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'importer le fichier audio",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSong = async (id: number) => {
    try {
      await api.deleteSong(id);
      toast({
        title: "Succès",
        description: "Fichier audio supprimé",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le fichier audio",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (event: ScheduledEvent) => {
    try {
      await api.updateScheduledEvent(event.id, {
        name: event.name,
        songId: event.song_id,
        scheduledTime: event.scheduled_time,
        daysOfWeek: event.days_of_week,
        active: !event.active
      });
      
      toast({
        title: "Succès",
        description: event.active ? "Événement désactivé" : "Événement activé"
      });
      
      loadData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'événement",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEvent = async (id: number) => {
    try {
      await api.deleteScheduledEvent(id);
      toast({
        title: "Succès",
        description: "Événement supprimé"
      });
      loadData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'événement",
        variant: "destructive"
      });
    }
  };

  const toggleDay = (dayValue: number) => {
    setNewEvent(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(dayValue)
        ? prev.daysOfWeek.filter(d => d !== dayValue)
        : [...prev.daysOfWeek, dayValue]
    }));
  };

  const getDayLabels = (daysOfWeek: number[]) => {
    return days
      .filter(d => daysOfWeek.includes(d.value))
      .map(d => d.label)
      .join(", ");
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
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, "0")}
                        </span>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => handleDeleteSong(song.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
            Programmez des fichiers audio à lire automatiquement aux heures définies
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Programmer un Fichier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Programmer une Lecture Automatique</DialogTitle>
              <DialogDescription>
                Le fichier interrompra la playlist en cours et reprendra après sa lecture
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la Programmation</Label>
                <Input
                  id="name"
                  placeholder="Ex: Prédication du Dimanche"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="song">Fichier Audio</Label>
                <Select
                  value={newEvent.songId}
                  onValueChange={(value) => setNewEvent({ ...newEvent, songId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un fichier" />
                  </SelectTrigger>
                  <SelectContent>
                    {songs.map(song => (
                      <SelectItem key={song.id} value={song.id.toString()}>
                        {song.title} - {song.artist}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Heure de Lecture</Label>
                <Input
                  id="time"
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Jours de la Semaine</Label>
                <div className="grid grid-cols-2 gap-2">
                  {days.map(day => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={newEvent.daysOfWeek.includes(day.value)}
                        onCheckedChange={() => toggleDay(day.value)}
                      />
                      <label
                        htmlFor={`day-${day.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {day.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleAddEvent} className="w-full">
                Programmer la Lecture
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="gradient-divine border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Fichiers Programmés
          </CardTitle>
          <CardDescription>
            Ces fichiers seront lus automatiquement aux heures définies
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement...
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
                  className={`transition-smooth hover:shadow-divine hover:border-accent/30 ${
                    !event.active ? 'opacity-50' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                          <Music className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-semibold">{event.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.song_title} - {event.artist}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {getDayLabels(event.days_of_week)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              à {event.scheduled_time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleToggleActive(event)}
                        >
                          {event.active ? (
                            <Power className="h-4 w-4 text-green-500" />
                          ) : (
                            <PowerOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
