import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const LiveStreamPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // URL du stream Icecast (à adapter selon votre configuration)
  const STREAM_URL = `http://${window.location.hostname}:8000/radio.mp3`;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.error('Erreur lecture:', err);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <Card className="p-6 bg-card">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Radio Kambove Live</h3>
            <p className="text-sm text-muted-foreground">Écoutez le flux en direct</p>
          </div>
          <div className="flex items-center gap-2">
            {isPlaying && (
              <span className="flex items-center gap-2 text-sm text-primary">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                En direct
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={togglePlay}
            size="lg"
            className="rounded-full h-14 w-14"
            variant={isPlaying ? "secondary" : "default"}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>

          <div className="flex-1 flex items-center gap-3">
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="icon"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={(value) => setVolume(value[0])}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground min-w-[3ch]">
              {isMuted ? 0 : volume}%
            </span>
          </div>
        </div>

        <audio
          ref={audioRef}
          src={STREAM_URL}
          preload="none"
        />
      </div>
    </Card>
  );
};

export default LiveStreamPlayer;
