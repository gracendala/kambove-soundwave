import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Trash2, Loader2, ArrowLeft, Play, GripVertical } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { playlistsAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { AudioPlayer } from "./AudioPlayer";

interface Song {
  id: string;
  title: string;
  artist?: string;
  file_path: string;
  duration?: number;
}

interface PlaylistSong {
  id: string;
  position: number;
  song_id: string;
  songs: Song;
}

interface PlaylistDetailProps {
  playlistId: string;
  playlistName: string;
  onBack: () => void;
}

export const PlaylistDetail = ({ playlistId, playlistName, onBack }: PlaylistDetailProps) => {
  const [songs, setSongs] = useState<PlaylistSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPlaylistSongs();
  }, [playlistId]);

  const loadPlaylistSongs = async () => {
    try {
      setLoading(true);
      const data = await playlistsAPI.getSongs(playlistId);
      setSongs(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de charger les chansons"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSong = async (playlistSongId: string, songId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir retirer cette chanson de la playlist ?")) return;

    try {
      await playlistsAPI.removeSong(playlistId, songId);

      toast({
        title: "Succès",
        description: "Chanson retirée de la playlist"
      });
      loadPlaylistSongs();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de retirer la chanson"
      });
    }
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      setCurrentlyPlaying(songs[0].songs.id);
      toast({
        title: "Lecture de la playlist",
        description: `${songs.length} chanson(s) dans la file d'attente`
      });
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">{playlistName}</h2>
          <p className="text-muted-foreground">
            {songs.length} {songs.length === 1 ? "chanson" : "chansons"}
          </p>
        </div>
        {songs.length > 0 && (
          <Button onClick={handlePlayAll} className="gap-2">
            <Play className="h-4 w-4" />
            Tout Lire
          </Button>
        )}
      </div>

      <Card className="gradient-divine border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-accent" />
            Chansons de la Playlist
          </CardTitle>
          <CardDescription>
            Gérez les chansons de cette playlist
          </CardDescription>
        </CardHeader>
        <CardContent>
          {songs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Music className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Cette playlist est vide</p>
              <p className="text-sm">Allez dans la bibliothèque audio pour ajouter des chansons</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {songs.map((playlistSong, index) => (
                  <Card 
                    key={playlistSong.id}
                    className="transition-smooth hover:shadow-divine hover:border-accent/30"
                  >
                    <CardContent className="p-0">
                      <div className="flex items-center gap-3 p-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <Music className="h-5 w-5 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{playlistSong.songs.title}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{playlistSong.songs.artist || "Artiste inconnu"}</span>
                              {playlistSong.songs.duration && (
                                <span>{formatDuration(playlistSong.songs.duration)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleRemoveSong(playlistSong.id, playlistSong.song_id)}
                          title="Retirer de la playlist"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="px-4 pb-4">
                        <AudioPlayer 
                          filePath={playlistSong.songs.file_path} 
                          title={playlistSong.songs.title}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};