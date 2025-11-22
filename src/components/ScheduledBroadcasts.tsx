import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus, Trash2, Clock, Music, Loader2, Radio } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Song {
  id: string;
  title: string;
  artist?: string;
}

interface ScheduledBroadcast {
  id: string;
  title: string;
  description?: string;
  scheduled_date: string;
  start_time: string;
  song_id?: string;
  songs?: {
    title: string;
    artist?: string;
  };
  created_at: string;
}

export const ScheduledBroadcasts = () => {
  const [broadcasts, setBroadcasts] = useState<ScheduledBroadcast[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newBroadcast, setNewBroadcast] = useState({
    title: "",
    description: "",
    scheduledDate: "",
    startTime: "",
    songId: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [{ data: broadcastsData, error: broadcastsError }, { data: songsData, error: songsError }] = await Promise.all([
        supabase
          .from('scheduled_events')
          .select(`
            *,
            songs (
              title,
              artist
            )
          `)
          .eq('event_type', 'one_time')
          .gte('scheduled_date', new Date().toISOString().split('T')[0])
          .order('scheduled_date')
          .order('start_time'),
        supabase
          .from('songs')
          .select('id, title, artist')
          .order('title')
      ]);

      if (broadcastsError) throw broadcastsError;
      if (songsError) throw songsError;

      setBroadcasts(broadcastsData || []);
      setSongs(songsData || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de charger les données"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBroadcast = async () => {
    if (!newBroadcast.title || !newBroadcast.scheduledDate || !newBroadcast.startTime || !newBroadcast.songId) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('scheduled_events')
        .insert([{
          event_type: 'one_time',
          title: newBroadcast.title,
          description: newBroadcast.description || null,
          scheduled_date: newBroadcast.scheduledDate,
          start_time: newBroadcast.startTime,
          song_id: newBroadcast.songId,
          created_by: user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Diffusion programmée avec succès"
      });

      setIsDialogOpen(false);
      setNewBroadcast({
        title: "",
        description: "",
        scheduledDate: "",
        startTime: "",
        songId: ""
      });
      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de programmer la diffusion"
      });
    }
  };

  const handleDeleteBroadcast = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette diffusion programmée ?")) return;

    try {
      const { error } = await supabase
        .from('scheduled_events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Diffusion programmée supprimée"
      });
      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de supprimer la diffusion"
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Diffusions Programmées</h3>
          <p className="text-muted-foreground">
            Programmez des prédications et contenus spéciaux à des dates précises
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Programmer une Diffusion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Programmer une Diffusion</DialogTitle>
              <DialogDescription>
                La playlist s'arrêtera automatiquement pour diffuser ce contenu
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de la Diffusion *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Prédication du Dimanche"
                  value={newBroadcast.title}
                  onChange={(e) => setNewBroadcast({ ...newBroadcast, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Description de la diffusion..."
                  value={newBroadcast.description}
                  onChange={(e) => setNewBroadcast({ ...newBroadcast, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newBroadcast.scheduledDate}
                    onChange={(e) => setNewBroadcast({ ...newBroadcast, scheduledDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Heure *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newBroadcast.startTime}
                    onChange={(e) => setNewBroadcast({ ...newBroadcast, startTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="song">Fichier Audio *</Label>
                <Select
                  value={newBroadcast.songId}
                  onValueChange={(value) => setNewBroadcast({ ...newBroadcast, songId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisissez un fichier audio" />
                  </SelectTrigger>
                  <SelectContent>
                    {songs.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        Aucun fichier audio disponible
                      </div>
                    ) : (
                      songs.map((song) => (
                        <SelectItem key={song.id} value={song.id}>
                          {song.title} {song.artist && `- ${song.artist}`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                <p className="text-sm text-muted-foreground">
                  <strong>Comment ça marche ?</strong>
                  <br />
                  À l'heure programmée, la playlist en cours s'arrêtera automatiquement. 
                  Le fichier audio sera diffusé, puis la playlist reprendra.
                </p>
              </div>

              <Button onClick={handleAddBroadcast} className="w-full gap-2" disabled={songs.length === 0}>
                <Radio className="h-4 w-4" />
                Programmer la Diffusion
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="gradient-divine border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            Diffusions à Venir
          </CardTitle>
          <CardDescription>
            Ces contenus seront diffusés automatiquement aux dates et heures programmées
          </CardDescription>
        </CardHeader>
        <CardContent>
          {broadcasts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Aucune diffusion programmée</p>
              <p className="text-sm">Programmez vos prédications et contenus spéciaux</p>
            </div>
          ) : (
            <div className="space-y-3">
              {broadcasts.map((broadcast) => (
                <Card 
                  key={broadcast.id} 
                  className="transition-smooth hover:shadow-divine hover:border-accent/30"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <Radio className="h-6 w-6 text-accent" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{broadcast.title}</h4>
                            <Badge variant="secondary" className="text-xs">
                              Programmé
                            </Badge>
                          </div>
                          {broadcast.description && (
                            <p className="text-sm text-muted-foreground mb-2">{broadcast.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(broadcast.scheduled_date)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {broadcast.start_time}
                            </div>
                            {broadcast.songs && (
                              <div className="flex items-center gap-1">
                                <Music className="h-3 w-3" />
                                {broadcast.songs.title}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleDeleteBroadcast(broadcast.id)}
                        className="flex-shrink-0"
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