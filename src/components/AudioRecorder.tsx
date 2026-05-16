import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Square, RotateCcw } from 'lucide-react';

interface AudioRecorderProps {
  onRecorded: (blob: Blob) => void;
  recordedBlob: Blob | null;
  onClear: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function AudioRecorder({ onRecorded, recordedBlob, onClear }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const barDurations = useRef(Array.from({ length: 20 }, () => 0.6 + Math.random() * 0.6));

  // Manage audio object URL lifecycle
  useEffect(() => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setAudioUrl(null);
    }
  }, [recordedBlob]);

  // Stop recording and release mic stream on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setPermissionDenied(false);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      } catch (err) {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        throw err;
      }
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((t) => t.stop());
        onRecorded(blob);
      };

      mediaRecorder.start(100);
      setRecording(true);
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } catch {
      setPermissionDenied(true);
    }
  }, [onRecorded]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecording(false);
  }, []);

  const handleClear = useCallback(() => {
    setElapsed(0);
    onClear();
  }, [onClear]);

  // If we have a recorded blob, show playback
  if (recordedBlob && audioUrl) {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl w-full max-w-md">
          <div className="flex-1">
            <p className="text-xs text-white/40 mb-1.5">Recorded audio ({formatTime(elapsed)})</p>
            <audio controls src={audioUrl} className="w-full h-8" />
          </div>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          Record again
        </button>
      </div>
    );
  }

  // Recording state
  if (recording) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        {/* Waveform animation */}
        <div className="flex items-center gap-1 h-12">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="w-1 bg-red-500 rounded-full animate-waveform-bar"
              style={{
                height: '100%',
                animationDelay: `${i * 0.05}s`,
                animationDuration: `${barDurations.current[i]}s`,
              }}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-lg font-mono text-white/90 tabular-nums">{formatTime(elapsed)}</span>
        </div>

        {/* Stop button */}
        <button
          onClick={stopRecording}
          className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shadow-lg shadow-red-500/20"
        >
          <Square className="h-6 w-6 text-white fill-white" />
        </button>
        <p className="text-xs text-white/40">Click to stop recording</p>
      </div>
    );
  }

  // Idle state — big record button
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="relative">
        {/* Decorative rings */}
        <div className="absolute inset-0 rounded-full border-2 border-red-500/10 scale-[1.6]" />
        <div className="absolute inset-0 rounded-full border border-red-500/5 scale-[2.2]" />

        <button
          onClick={startRecording}
          className="relative h-20 w-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-red-500/25"
        >
          <Mic className="h-8 w-8 text-white" />
        </button>
      </div>
      <p className="text-sm text-white/50 mt-2">Tap to start recording</p>
      {permissionDenied && (
        <p className="text-xs text-red-400 mt-1">
          Microphone access was denied. Please allow microphone access in your browser settings.
        </p>
      )}
    </div>
  );
}
