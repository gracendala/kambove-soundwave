import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Music, Plus, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Playlist {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export const PlaylistManager = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPlaylists(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de charger les playlists"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlaylist = async () => {
    if (!newPlaylistName.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le nom de la playlist est requis"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('playlists')
        .insert([{
          name: newPlaylistName,
          description: newPlaylistDesc || null,
          created_by: user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Playlist créée avec succès"
      });
      setNewPlaylistName("");
      setNewPlaylistDesc("");
      setDialogOpen(false);
      loadPlaylists();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de créer la playlist"
      });
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette playlist ?")) return;

    try {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Playlist supprimée"
      });
      loadPlaylists();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de supprimer la playlist"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestion des Playlists</h2>
          <p className="text-muted-foreground">Organisez votre programmation musicale</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une Nouvelle Playlist</DialogTitle>
              <DialogDescription>
                Donnez un nom et une description à votre nouvelle playlist
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la Playlist *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Louanges du Matin"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Description de la playlist..."
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  rows={3}
                />
              </div>
              <Button onClick={handleAddPlaylist} className="w-full">
                Créer la Playlist
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {playlists.length === 0 ? (
          <Card className="p-12 text-center">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucune playlist pour le moment</p>
            <p className="text-sm text-muted-foreground">Créez votre première playlist pour commencer</p>
          </Card>
        ) : (
          playlists.map((playlist) => (
            <Card key={playlist.id} className="transition-smooth hover:shadow-divine hover:border-accent/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Music className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <CardTitle>{playlist.name}</CardTitle>
                      <CardDescription>
                        Créée le {new Date(playlist.created_at).toLocaleDateString('fr-FR')}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleDeletePlaylist(playlist.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {playlist.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{playlist.description}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
