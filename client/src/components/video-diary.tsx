import { useState, useRef, useCallback, useEffect } from "react";
import { Video, Square, Upload, Loader2, X, Download, Play, Pause, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import * as tus from "tus-js-client";

interface VideoUploadProps {
  onVideoReady: (assetId: string, playbackId: string) => void;
  onCancel: () => void;
}

type UploadState = "idle" | "recording" | "preview" | "uploading" | "processing" | "done" | "error";

export function VideoUpload({ onVideoReady, onCancel }: VideoUploadProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: true 
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") 
          ? "video/webm;codecs=vp9,opus" 
          : "video/webm" 
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setState("preview");
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
        }
      };

      mediaRecorder.start(1000);
      setState("recording");
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } catch (err) {
      setErrorMsg("Could not access camera/microphone. Please grant permission.");
      setState("error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith("video/")) {
      setErrorMsg("Please select a video file");
      setState("error");
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      setErrorMsg("Video must be under 500MB");
      setState("error");
      return;
    }

    setRecordedBlob(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setState("preview");
  };

  const uploadVideo = async () => {
    if (!recordedBlob) return;

    setState("uploading");
    setProgress(0);

    try {
      const name = `video-diary-${new Date().toISOString().split("T")[0]}-${Date.now()}`;
      const res = await apiRequest("POST", "/api/video/upload", { name });
      const { tusEndpoint, assetId, playbackId } = await res.json();

      if (!tusEndpoint || !assetId) {
        throw new Error("Failed to get upload URL");
      }

      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(recordedBlob!, {
          endpoint: tusEndpoint,
          metadata: {
            filename: `${name}.webm`,
            filetype: recordedBlob!.type,
          },
          uploadSize: recordedBlob!.size,
          onError: (error) => {
            reject(error);
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            setProgress(Math.round((bytesUploaded / bytesTotal) * 100));
          },
          onSuccess: () => {
            resolve();
          },
        });
        upload.start();
      });

      setState("processing");
      
      let attempts = 0;
      const maxAttempts = 60;
      const checkReady = async (): Promise<void> => {
        attempts++;
        try {
          const statusRes = await fetch(`/api/video/asset/${assetId}`);
          const status = await statusRes.json();
          
          if (status.status?.phase === "ready") {
            onVideoReady(assetId, playbackId || status.playbackId);
            setState("done");
            return;
          }
          
          if (status.status?.phase === "failed") {
            throw new Error("Video processing failed");
          }
        } catch (err) {
          if (attempts >= maxAttempts) {
            onVideoReady(assetId, playbackId || "");
            setState("done");
            return;
          }
        }
        
        if (attempts < maxAttempts) {
          await new Promise(r => setTimeout(r, 3000));
          return checkReady();
        }
        
        onVideoReady(assetId, playbackId || "");
        setState("done");
      };

      await checkReady();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
      setState("error");
    }
  };

  const retake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setRecordedBlob(null);
    setPreviewUrl(null);
    setRecordingTime(0);
    setState("idle");
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden" data-testid="video-diary-upload">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Video Journal</span>
          </div>
          {state !== "uploading" && state !== "processing" && (
            <button onClick={() => { cleanup(); onCancel(); }} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all" data-testid="button-close-video">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {state === "idle" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="flex gap-3">
              <Button onClick={startRecording} className="h-12 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm shadow-lg" data-testid="button-start-recording">
                <Video className="w-4 h-4 mr-2" />
                Record
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="h-12 px-6 rounded-xl border-white/10 text-gray-300 hover:text-white hover:bg-white/5 font-medium text-sm" data-testid="button-upload-video">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
            <p className="text-xs text-gray-500">Record a video journal or upload one (max 500MB)</p>
            <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" data-testid="input-video-file" />
          </div>
        )}

        {state === "recording" && (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
              <video ref={videoRef} muted playsInline className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
              <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/90 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-xs font-semibold text-white">{formatTime(recordingTime)}</span>
              </div>
            </div>
            <Button onClick={stopRecording} className="w-full h-11 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm" data-testid="button-stop-recording">
              <Square className="w-4 h-4 mr-2 fill-current" />
              Stop Recording
            </Button>
          </div>
        )}

        {state === "preview" && previewUrl && (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
              <video ref={previewVideoRef} src={previewUrl} controls playsInline className="w-full h-full object-contain" />
            </div>
            <div className="flex gap-2">
              <Button onClick={retake} variant="outline" className="flex-1 h-11 rounded-xl border-white/10 text-gray-300 hover:text-white font-medium text-sm" data-testid="button-retake">
                Retake
              </Button>
              <Button onClick={uploadVideo} className="flex-1 h-11 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm shadow-lg" data-testid="button-upload-confirm">
                <Upload className="w-4 h-4 mr-2" />
                Upload & Attach
              </Button>
            </div>
          </div>
        )}

        {state === "uploading" && (
          <div className="py-6 space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
              <span className="text-sm text-gray-300 font-medium">Uploading... {progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {state === "processing" && (
          <div className="py-6 flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
            <div>
              <p className="text-sm text-gray-300 font-medium">Processing video...</p>
              <p className="text-xs text-gray-500">This may take a minute</p>
            </div>
          </div>
        )}

        {state === "done" && (
          <div className="py-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <Play className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-sm text-green-400 font-medium">Video attached to entry</p>
          </div>
        )}

        {state === "error" && (
          <div className="py-4 space-y-3">
            <p className="text-sm text-red-400">{errorMsg}</p>
            <Button onClick={retake} variant="outline" className="h-10 rounded-xl border-white/10 text-gray-300 hover:text-white font-medium text-sm" data-testid="button-retry-video">
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface VideoPlayerProps {
  playbackId: string;
  assetId: string;
  compact?: boolean;
}

export function VideoPlayer({ playbackId, assetId, compact = false }: VideoPlayerProps) {
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    
    const fetchPlayback = async () => {
      try {
        const res = await fetch(`/api/video/asset/${assetId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        
        if (!cancelled) {
          if (data.playbackUrl) {
            setPlaybackUrl(data.playbackUrl);
          } else if (data.playbackId || playbackId) {
            setPlaybackUrl(`https://livepeercdn.studio/hls/${data.playbackId || playbackId}/index.m3u8`);
          }
          if (data.downloadUrl) {
            setDownloadUrl(data.downloadUrl);
          }
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setPlaybackUrl(`https://livepeercdn.studio/hls/${playbackId}/index.m3u8`);
          setLoading(false);
        }
      }
    };

    fetchPlayback();
    return () => { cancelled = true; };
  }, [playbackId, assetId]);

  const handleDownload = async () => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
    } else {
      try {
        const res = await fetch(`/api/video/asset/${assetId}`);
        const data = await res.json();
        if (data.downloadUrl) {
          window.open(data.downloadUrl, "_blank");
        }
      } catch {}
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'py-2' : 'py-4'}`}>
        <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
        <span className="text-xs text-gray-500">Loading video...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'py-2' : 'py-4'}`}>
        <Video className="w-4 h-4 text-gray-500" />
        <span className="text-xs text-gray-500">Video unavailable</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${compact ? 'mt-2' : 'mt-3'}`} data-testid="video-player">
      <div className="rounded-xl overflow-hidden bg-black aspect-video">
        <video 
          src={playbackUrl || undefined} 
          controls 
          playsInline 
          className="w-full h-full object-contain"
          onError={() => setError(true)}
        />
      </div>
      <div className="flex gap-2">
        <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all" data-testid="button-download-video">
          <Download className="w-3.5 h-3.5" />
          Download
        </button>
      </div>
    </div>
  );
}
