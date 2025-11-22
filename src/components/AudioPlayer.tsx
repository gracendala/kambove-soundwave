import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/lib/supabase";

interface AudioPlayerProps {
  filePath: string;
  title: string;
  compact?: boolean;
}

export const AudioPlayer = ({ filePath, title, compact = false }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    loadAudioUrl();
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [filePath]);

  const loadAudioUrl = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.storage
        .from('audio-files')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      setAudioUrl(url);
    } catch (error) {
      console.error("Erreur lors du chargement de l'audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {audioUrl && <audio ref={audioRef} src={audioUrl} />}
        <Button
          size="icon"
          variant="ghost"
          onClick={togglePlayPause}
          disabled={isLoading || !audioUrl}
          className="h-8 w-8"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        {isPlaying && (
          <span className="text-xs text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50">
      {audioUrl && <audio ref={audioRef} src={audioUrl} />}
      
      <div className="flex items-center gap-3">
        <Button
          size="icon"
          variant="outline"
          onClick={togglePlayPause}
          disabled={isLoading || !audioUrl}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>

        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium truncate">{title}</p>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            disabled={!audioUrl}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-24">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleMute}
            disabled={!audioUrl}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            disabled={!audioUrl}
            className="w-16"
          />
        </div>
      </div>
    </div>
  );
};