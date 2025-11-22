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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { songsAPI, playlistsAPI } from "@/services/api";
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
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    filterAndSortSongs();
    setCurrentPage(1); // Reset to first page when filters change
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
      const [songsData, playlistsData] = await Promise.all([
        songsAPI.getAll(),
        playlistsAPI.getAll()
      ]);

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
      const formData = new FormData();
      formData.append('audio', uploadFile);

      await songsAPI.upload(formData);

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
      await songsAPI.delete(id);

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
      // Get songs in playlist to calculate next position
      const playlistSongs = await playlistsAPI.getSongs(selectedPlaylist);
      const nextPosition = playlistSongs && playlistSongs.length > 0
        ? Math.max(...playlistSongs.map((s: any) => s.position)) + 1
        : 0;

      await playlistsAPI.addSong(selectedPlaylist, selectedSongForPlaylist, nextPosition);

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
          <>
            <ScrollArea className="h-[600px]">
              <div className="border border-border/50 rounded-md overflow-hidden">
                {/* Header */}
                <div className="bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground flex items-center gap-3 border-b border-border/50">
                  <span className="w-10">#</span>
                  <span className="flex-1">Titre</span>
                  <span className="w-20 hidden sm:block">Durée</span>
                  <span className="w-24">Actions</span>
                </div>
                
                {/* Rows */}
                <div className="divide-y divide-border/30">
                  {filteredSongs
                    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                    .map((song, index) => {
                      const absoluteIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                      return (
                        <div
                          key={song.id}
                          className="group hover:bg-accent/5 transition-colors"
                        >
                          <div className="flex items-center gap-3 px-4 py-2.5">
                            <span className="text-xs text-muted-foreground/70 w-10 flex-shrink-0">
                              {absoluteIndex}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{song.title}</p>
                              {song.artist && (
                                <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                              )}
                            </div>
                            {song.duration && (
                              <span className="text-xs text-muted-foreground w-20 hidden sm:block flex-shrink-0">
                                {formatDuration(song.duration)}
                              </span>
                            )}
                            <div className="flex items-center gap-0.5 w-24 justify-end flex-shrink-0">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openAddToPlaylistDialog(song.id)}
                                title="Ajouter à une playlist"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100"
                              >
                                <ListPlus className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteSong(song.id, song.file_path)}
                                title="Supprimer"
                                className="h-7 w-7 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          <div className="px-4 pb-2">
                            <AudioPlayer 
                              filePath={song.file_path} 
                              title={song.title}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </ScrollArea>

            {/* Pagination */}
            {filteredSongs.length > ITEMS_PER_PAGE && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {(() => {
                      const totalPages = Math.ceil(filteredSongs.length / ITEMS_PER_PAGE);
                      const pages = [];
                      
                      if (totalPages <= 7) {
                        // Show all pages if 7 or fewer
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(
                            <PaginationItem key={i}>
                              <PaginationLink
                                onClick={() => setCurrentPage(i)}
                                isActive={currentPage === i}
                                className="cursor-pointer"
                              >
                                {i}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                      } else {
                        // Always show first page
                        pages.push(
                          <PaginationItem key={1}>
                            <PaginationLink
                              onClick={() => setCurrentPage(1)}
                              isActive={currentPage === 1}
                              className="cursor-pointer"
                            >
                              1
                            </PaginationLink>
                          </PaginationItem>
                        );

                        // Show ellipsis or pages around current page
                        if (currentPage > 3) {
                          pages.push(
                            <PaginationItem key="ellipsis1">
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }

                        // Show pages around current page
                        const start = Math.max(2, currentPage - 1);
                        const end = Math.min(totalPages - 1, currentPage + 1);
                        
                        for (let i = start; i <= end; i++) {
                          pages.push(
                            <PaginationItem key={i}>
                              <PaginationLink
                                onClick={() => setCurrentPage(i)}
                                isActive={currentPage === i}
                                className="cursor-pointer"
                              >
                                {i}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }

                        // Show ellipsis before last page
                        if (currentPage < totalPages - 2) {
                          pages.push(
                            <PaginationItem key="ellipsis2">
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }

                        // Always show last page
                        pages.push(
                          <PaginationItem key={totalPages}>
                            <PaginationLink
                              onClick={() => setCurrentPage(totalPages)}
                              isActive={currentPage === totalPages}
                              className="cursor-pointer"
                            >
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      
                      return pages;
                    })()}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(Math.min(Math.ceil(filteredSongs.length / ITEMS_PER_PAGE), currentPage + 1))}
                        className={currentPage === Math.ceil(filteredSongs.length / ITEMS_PER_PAGE) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
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