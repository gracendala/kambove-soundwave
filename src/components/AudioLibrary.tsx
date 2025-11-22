import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music, Upload, Trash2, Loader2, ListPlus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { AudioPlayer } from "./AudioPlayer";

interface Song {
  id: string;
  title: string;
  artist?: string;
  duration?: number;
  file_path: string;
  file_size?: number;
  created_at: string;
}

interface Playlist {
  id: string;
  name: string;
}

export const AudioLibrary = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState<string>("");
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>("");
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      setLoading(true);
      const [{ data: songsData, error: songsError }, { data: playlistsData, error: playlistsError }] = await Promise.all([
        supabase
          .from('songs')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('playlists')
          .select('id, name')
          .order('name')
      ]);

      if (songsError) throw songsError;
      if (playlistsError) throw playlistsError;

      setSongs(songsData || []);
      setPlaylists(playlistsData || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de charger les fichiers audio"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setUploadFile(file);
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un fichier audio"
      });
      return;
    }

    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(filePath, uploadFile);

      if (uploadError) throw uploadError;

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
        description: "Fichier audio importé avec succès"
      });
      setUploadFile(null);
      loadSongs();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible d'importer le fichier audio"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSong = async (id: string, filePath: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce fichier audio ?")) return;

    try {
      await supabase.storage.from('audio-files').remove([filePath]);

      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Fichier audio supprimé"
      });
      loadSongs();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de supprimer le fichier audio"
      });
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Taille inconnue";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddToPlaylist = async () => {
    if (!selectedPlaylist || !selectedSongForPlaylist) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner une playlist"
      });
      return;
    }

    try {
      // Get the current max position in the playlist
      const { data: existingSongs, error: fetchError } = await supabase
        .from('playlist_songs')
        .select('position')
        .eq('playlist_id', selectedPlaylist)
        .order('position', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const nextPosition = existingSongs && existingSongs.length > 0 
        ? existingSongs[0].position + 1 
        : 0;

      const { error } = await supabase
        .from('playlist_songs')
        .insert([{
          playlist_id: selectedPlaylist,
          song_id: selectedSongForPlaylist,
          position: nextPosition
        }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Chanson ajoutée à la playlist"
      });

      setIsAddToPlaylistOpen(false);
      setSelectedPlaylist("");
      setSelectedSongForPlaylist("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible d'ajouter à la playlist"
      });
    }
  };

  const openAddToPlaylistDialog = (songId: string) => {
    setSelectedSongForPlaylist(songId);
    setIsAddToPlaylistOpen(true);
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
    <Card className="transition-smooth hover:shadow-divine hover:border-accent/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5 text-accent" />
          Bibliothèque Audio
        </CardTitle>
        <CardDescription>
          Gérez vos fichiers audio pour la programmation et les diffusions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="sm:flex-1"
          />
          <Button
            onClick={handleUpload}
            disabled={!uploadFile || uploading}
            className="gap-2"
          >
            {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
            <Upload className="h-4 w-4" />
            Importer
          </Button>
        </div>

        {songs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Music className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Aucun fichier audio pour le moment</p>
            <p className="text-sm">Importez vos prédications et musiques</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] rounded-md border border-border/50 p-3">
            <div className="space-y-3">
              {songs.map((song) => (
                <div
                  key={song.id}
                  className="rounded-lg bg-card border border-border/30 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-3 py-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Music className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{song.title}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{song.artist || "Artiste inconnu"}</span>
                          {song.duration && <span>{formatDuration(song.duration)}</span>}
                          <span>{formatFileSize(song.file_size)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => openAddToPlaylistDialog(song.id)}
                        title="Ajouter à une playlist"
                      >
                        <ListPlus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleDeleteSong(song.id, song.file_path)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="px-3 pb-3">
                    <AudioPlayer 
                      filePath={song.file_path} 
                      title={song.title}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      <Dialog open={isAddToPlaylistOpen} onOpenChange={setIsAddToPlaylistOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter à une Playlist</DialogTitle>
            <DialogDescription>
              Sélectionnez la playlist dans laquelle ajouter ce fichier audio
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="playlist">Playlist</Label>
              <Select value={selectedPlaylist} onValueChange={setSelectedPlaylist}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisissez une playlist" />
                </SelectTrigger>
                <SelectContent>
                  {playlists.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Aucune playlist disponible
                    </div>
                  ) : (
                    playlists.map((playlist) => (
                      <SelectItem key={playlist.id} value={playlist.id}>
                        {playlist.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleAddToPlaylist} 
              className="w-full"
              disabled={playlists.length === 0}
            >
              Ajouter à la Playlist
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};