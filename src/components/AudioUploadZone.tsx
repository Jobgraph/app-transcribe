import { useState, useRef, type DragEvent } from 'react';
import { Upload, X } from 'lucide-react';

const AUDIO_ACCEPT = '.mp3,.wav,.m4a,.webm,.ogg';
const AUDIO_EXTENSIONS = ['mp3', 'wav', 'm4a', 'webm', 'ogg'];

interface AudioUploadZoneProps {
  onFile: (file: File) => void;
  uploadedFile: File | null;
  onClear: () => void;
}

export function AudioUploadZone({ onFile, uploadedFile, onClear }: AudioUploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function validateAndSet(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!AUDIO_EXTENSIONS.includes(ext)) {
      setError(`Unsupported file type (.${ext}). Accepted: ${AUDIO_EXTENSIONS.join(', ')}`);
      return;
    }
    setError(null);
    onFile(file);
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSet(file);
  };

  const onDragOver = (e: DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  if (uploadedFile) {
    const url = URL.createObjectURL(uploadedFile);
    const sizeMB = (uploadedFile.size / (1024 * 1024)).toFixed(1);

    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl w-full max-w-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/80 truncate max-w-[260px]">{uploadedFile.name}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">{sizeMB} MB</span>
              <button
                onClick={() => { URL.revokeObjectURL(url); onClear(); }}
                className="text-white/40 hover:text-white/80 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <audio controls src={url} className="w-full h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-indigo-500 bg-indigo-500/5'
            : 'border-white/10 hover:border-white/25'
        }`}
      >
        <Upload className="h-8 w-8 mx-auto mb-3 text-white/30" />
        <p className="text-sm text-white/60">
          Drop an audio file here, or <span className="text-indigo-400 font-medium">browse</span>
        </p>
        <p className="text-[11px] text-white/30 mt-1.5">
          MP3, WAV, M4A, WebM, OGG
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={AUDIO_ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) validateAndSet(file);
          }}
        />
      </div>
      {error && (
        <p className="text-xs text-red-400 mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
