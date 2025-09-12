import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface VideoStreamerProps {
  videoUrl: string; // precisa ser MP4 direto se for usar nativo
  title: string;
}

export function VideoStreamer({ videoUrl, title }: VideoStreamerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reage a troca de URL: volta para loading e zera estados básicos
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      setDuration(video.duration || 0);
      setIsLoading(false);
    };
    const onCanPlay = () => {
      // Em alguns servidores o canplay dispara antes do loadedmetadata
      if (isLoading) setIsLoading(false);
    };
    const onTimeUpdate = () => setCurrentTime(video.currentTime || 0);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    const onError = () => {
      setIsLoading(false);
      setError("Não foi possível carregar o vídeo (verifique se a URL é MP4 direto e CORS/Range estão habilitados).");
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("error", onError);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("error", onError);
    };
  }, [videoUrl, isLoading]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        await video.play();
        setIsPlaying(true);
      }
    } catch (e) {
      // autoplay policies ou erro de codec
      setError("Falha ao iniciar a reprodução. Clique novamente ou verifique o formato.");
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    const seekTime = (value[0] / 100) * (duration || 0);
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = value[0] / 100;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const restart = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  return (
    <div className="w-full bg-background rounded-lg overflow-hidden border">
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full h-auto max-h-96"
          // IMPORTANTE: para Cloudinary liberar CORS + Range
          crossOrigin="anonymous"
          preload="metadata"
          controls={false}
        >
          {/* Força o MIME correto */}
          <source src={videoUrl} type="video/mp4" />
          Seu navegador não suporta vídeo HTML5.
        </video>

        {(isLoading || error) && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/60">
            {error ? (
              <div className="text-sm text-red-600 px-4 text-center">{error}</div>
            ) : (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-sm">{title}</h3>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={togglePlay} disabled={isLoading || !!error}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <Button variant="ghost" size="sm" onClick={restart} disabled={isLoading || !!error}>
              <RotateCcw className="h-4 w-4" />
            </Button>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={toggleMute} disabled={isLoading || !!error}>
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>

              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={toggleFullscreen} disabled={isLoading || !!error}>
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
