import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music, Upload, Trash2, Loader2, ListPlus, Search, SortAsc, SortDesc } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState<string>("");
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>("");
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "artist">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();

  useEffect(() => {
    filterAndSortSongs();
  }, [songs, searchQuery, sortBy, sortOrder]);

  const filterAndSortSongs = () => {
    let filtered = [...songs];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(song => 
        song.title.toLowerCase().includes(query) ||
        (song.artist && song.artist.toLowerCase().includes(query))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "name":
          comparison = a.title.localeCompare(b.title);
          break;
        case "artist":
          comparison = (a.artist || "").localeCompare(b.artist || "");
          break;
        case "date":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredSongs(filtered);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };

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
      // Check if song already exists in playlist
      const { data: existingEntry, error: checkError } = await supabase
        .from('playlist_songs')
        .select('id')
        .eq('playlist_id', selectedPlaylist)
        .eq('song_id', selectedSongForPlaylist)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingEntry) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Cette chanson est déjà dans la playlist"
        });
        return;
      }

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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5 text-accent" />
              Bibliothèque Audio
            </CardTitle>
            <CardDescription>
              {songs.length} fichier{songs.length !== 1 ? "s" : ""} audio
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-lg">
            {filteredSongs.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
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
          </CardContent>
        </Card>

        {/* Search and Sort Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre ou artiste..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Titre</SelectItem>
                <SelectItem value="artist">Artiste</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSortOrder}
              title={sortOrder === "asc" ? "Ordre croissant" : "Ordre décroissant"}
            >
              {sortOrder === "asc" ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Results Info */}
        {searchQuery && (
          <div className="text-sm text-muted-foreground">
            {filteredSongs.length} résultat{filteredSongs.length !== 1 ? "s" : ""} pour "{searchQuery}"
          </div>
        )}

        {/* Songs List */}
        {songs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Music className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Aucun fichier audio pour le moment</p>
            <p className="text-sm">Importez vos prédications et musiques</p>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Aucun résultat trouvé</p>
            <p className="text-sm">Essayez un autre terme de recherche</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] rounded-md border border-border/50">
            <div className="divide-y divide-border/50">
              {filteredSongs.map((song, index) => (
                <div
                  key={song.id}
                  className="group flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors animate-fade-in"
                >
                  <span className="text-sm text-muted-foreground w-8 flex-shrink-0">
                    {index + 1}
                  </span>
                  <Music className="h-4 w-4 text-accent flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{song.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {song.artist && <span>{song.artist}</span>}
                      {song.duration && <span>• {formatDuration(song.duration)}</span>}
                    </div>
                    <div className="mt-2">
                      <AudioPlayer 
                        filePath={song.file_path} 
                        title={song.title}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openAddToPlaylistDialog(song.id)}
                      title="Ajouter à une playlist"
                      className="h-8 w-8"
                    >
                      <ListPlus className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteSong(song.id, song.file_path)}
                      title="Supprimer"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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