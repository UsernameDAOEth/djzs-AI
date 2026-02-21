import { useState, useRef, useEffect, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Upload,
  Trash2,
  X,
  Headphones,
  Zap,
  Heart,
  Lightbulb,
  MoreVertical,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  vault,
  addMusicTrack,
  deleteMusicTrack,
  updateMusicTrackZone,
  type MusicTrack,
  type MusicZone,
} from "@/lib/vault";

interface MusicPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ZONES: { id: MusicZone; label: string; icon: typeof Zap }[] = [
  { id: "focus", label: "Focus", icon: Zap },
  { id: "reflection", label: "Reflection", icon: Heart },
  { id: "creative", label: "Creative", icon: Lightbulb },
];

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function MusicPanel({ isOpen, onClose }: MusicPanelProps) {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [currentTrackId, setCurrentTrackId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeZoneFilter, setActiveZoneFilter] = useState<MusicZone | null>(null);
  const [trackMenuId, setTrackMenuId] = useState<number | null>(null);
  const playNextRef = useRef<() => void>(() => {});

  const allTracks = useLiveQuery(() => vault.musicTracks.orderBy("uploadedAt").reverse().toArray(), []);
  const tracks = allTracks ?? [];

  const filteredTracks = activeZoneFilter
    ? tracks.filter((t) => t.zone === activeZoneFilter)
    : tracks;

  const currentTrack = tracks.find((t) => t.id === currentTrackId) || null;

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume / 100;
    }

    const audio = audioRef.current;

    const onTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
      }
    };
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    const onEnded = () => {
      playNextRef.current();
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  const playTrack = useCallback(
    (track: MusicTrack) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      const blob = new Blob([track.blob], { type: track.type });
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      audio.src = url;
      audio.play();
      setCurrentTrackId(track.id!);
      setIsPlaying(true);
    },
    []
  );

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrackId) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  }, [isPlaying, currentTrackId]);

  const playNext = useCallback(() => {
    const list = filteredTracks.length > 0 ? filteredTracks : tracks;
    if (list.length === 0) return;
    const idx = list.findIndex((t) => t.id === currentTrackId);
    const next = list[(idx + 1) % list.length];
    playTrack(next);
  }, [tracks, filteredTracks, currentTrackId, playTrack]);

  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

  const playPrev = useCallback(() => {
    const list = filteredTracks.length > 0 ? filteredTracks : tracks;
    if (list.length === 0) return;
    const idx = list.findIndex((t) => t.id === currentTrackId);
    const prev = list[(idx - 1 + list.length) % list.length];
    playTrack(prev);
  }, [tracks, filteredTracks, currentTrackId, playTrack]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar || !audio.duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * audio.duration;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val / 100;
    }
    if (val > 0 && isMuted) setIsMuted(false);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    let count = 0;
    for (const file of Array.from(files)) {
      if (file.type.startsWith("audio/")) {
        await addMusicTrack(file);
        count++;
      }
    }
    setIsUploading(false);
    if (count > 0) {
      toast({ title: "Music Added", description: `${count} track${count > 1 ? "s" : ""} added to your library.` });
    } else {
      toast({ title: "No Audio Files", description: "Only audio files (mp3, wav, etc.) are supported.", variant: "destructive" });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDeleteTrack = async (id: number) => {
    if (currentTrackId === id) {
      audioRef.current?.pause();
      setCurrentTrackId(null);
      setIsPlaying(false);
    }
    await deleteMusicTrack(id);
    setTrackMenuId(null);
    toast({ title: "Track Removed", description: "Track deleted from your library." });
  };

  const handleAssignZone = async (trackId: number, zone: MusicZone) => {
    await updateMusicTrackZone(trackId, zone);
    setTrackMenuId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-[340px] sm:w-[380px] z-50 flex flex-col border-l border-border bg-card/95 backdrop-blur-xl shadow-2xl animate-in slide-in-from-right duration-300" data-testid="music-panel">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-orange-500/15">
            <Headphones className="w-4.5 h-4.5 text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Music Library</p>
            <p className="text-[10px] text-muted-foreground">{tracks.length} track{tracks.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors" data-testid="button-close-music">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {currentTrack && (
        <div className="px-5 py-4 border-b border-border bg-orange-500/[0.04]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
              <Music className="w-5 h-5 text-orange-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate" data-testid="text-now-playing">{currentTrack.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {currentTrack.zone ? `${currentTrack.zone} zone` : "Local file"} · {formatFileSize(currentTrack.size)}
              </p>
            </div>
          </div>

          <div
            ref={progressRef}
            className="w-full h-1.5 bg-muted rounded-full cursor-pointer mb-2 group"
            onClick={handleSeek}
            data-testid="music-progress-bar"
          >
            <div
              className="h-full bg-orange-500 rounded-full relative transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-orange-400 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{formatDuration(currentTime)}</span>
            <span>{duration > 0 ? formatDuration(duration) : "--:--"}</span>
          </div>

          <div className="flex items-center justify-center gap-4 mt-3">
            <button onClick={playPrev} className="p-2 rounded-lg hover:bg-muted transition-colors" data-testid="button-prev-track">
              <SkipBack className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={togglePlayPause}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
              style={{ background: "#F37E20" }}
              data-testid="button-play-pause"
            >
              {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
            </button>
            <button onClick={playNext} className="p-2 rounded-lg hover:bg-muted transition-colors" data-testid="button-next-track">
              <SkipForward className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button onClick={toggleMute} className="p-1 rounded hover:bg-muted" data-testid="button-mute">
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="flex-1 h-1 accent-orange-500 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-400"
              data-testid="input-volume"
            />
            <span className="text-[10px] text-muted-foreground w-7 text-right">{isMuted ? 0 : volume}%</span>
          </div>
        </div>
      )}

      <div className="px-5 py-3 border-b border-border">
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveZoneFilter(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeZoneFilter === null
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                : "text-muted-foreground hover:text-foreground bg-muted/50 border border-border"
            }`}
            data-testid="button-filter-all"
          >
            All
          </button>
          {ZONES.map((z) => {
            const Icon = z.icon;
            return (
              <button
                key={z.id}
                onClick={() => setActiveZoneFilter(activeZoneFilter === z.id ? null : z.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeZoneFilter === z.id
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "text-muted-foreground hover:text-foreground bg-muted/50 border border-border"
                }`}
                data-testid={`button-filter-${z.id}`}
              >
                <Icon className="w-3 h-3" />
                {z.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {filteredTracks.length === 0 && !isUploading && (
          <div className="px-5 py-10 text-center">
            <Music className="w-8 h-8 text-muted-foreground/80 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {activeZoneFilter ? `No tracks in ${activeZoneFilter} zone` : "No music yet"}
            </p>
            <p className="text-xs text-muted-foreground/80 mt-1">Upload audio files below</p>
          </div>
        )}

        {filteredTracks.map((track) => (
          <div
            key={track.id}
            className={`group flex items-center gap-3 px-5 py-3 border-b border-border cursor-pointer transition-all hover:bg-muted ${
              currentTrackId === track.id ? "bg-orange-500/[0.08] border-l-2 border-l-orange-500" : ""
            }`}
            onClick={() => playTrack(track)}
            data-testid={`track-item-${track.id}`}
          >
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              {currentTrackId === track.id && isPlaying ? (
                <div className="flex items-end gap-[2px] h-3">
                  <span className="w-[3px] bg-orange-400 rounded-full animate-pulse" style={{ height: "60%", animationDelay: "0ms" }} />
                  <span className="w-[3px] bg-orange-400 rounded-full animate-pulse" style={{ height: "100%", animationDelay: "150ms" }} />
                  <span className="w-[3px] bg-orange-400 rounded-full animate-pulse" style={{ height: "40%", animationDelay: "300ms" }} />
                </div>
              ) : (
                <Music className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm truncate ${currentTrackId === track.id ? "text-orange-300 font-medium" : "text-foreground/80"}`}>
                {track.name}
              </p>
              <p className="text-[10px] text-muted-foreground/80">
                {formatFileSize(track.size)}
                {track.zone && (
                  <span className="ml-1.5 text-orange-400/60">· {track.zone}</span>
                )}
              </p>
            </div>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTrackMenuId(trackMenuId === track.id ? null : track.id!);
                }}
                className="p-1.5 rounded-lg text-muted-foreground/80 hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-all"
                data-testid={`button-track-menu-${track.id}`}
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
              {trackMenuId === track.id && (
                <div className="absolute right-0 top-8 z-10 w-44 py-1.5 rounded-xl bg-card border border-border shadow-xl animate-in fade-in zoom-in-95 duration-150" data-testid={`track-menu-${track.id}`}>
                  {ZONES.map((z) => {
                    const Icon = z.icon;
                    return (
                      <button
                        key={z.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignZone(track.id!, z.id);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-muted transition-colors ${
                          track.zone === z.id ? "text-orange-400" : "text-muted-foreground"
                        }`}
                        data-testid={`button-assign-zone-${z.id}-${track.id}`}
                      >
                        <Icon className="w-3 h-3" />
                        {z.label} Zone
                        {track.zone === z.id && <span className="ml-auto text-orange-400">✓</span>}
                      </button>
                    );
                  })}
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTrack(track.id!);
                    }}
                    className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 text-red-400 hover:bg-red-500/10 transition-colors"
                    data-testid={`button-delete-track-${track.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-4 border-t border-border">
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`w-full p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all text-center ${
            isDragOver
              ? "border-orange-500/50 bg-orange-500/[0.08]"
              : "border-border hover:border-orange-500/30 hover:bg-muted"
          }`}
          data-testid="music-upload-area"
        >
          {isUploading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-muted-foreground">Uploading...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Drop audio files or click to upload</span>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
          data-testid="input-music-upload"
        />
      </div>
    </div>
  );
}
