import { useState, useRef, type DragEvent } from 'react';
import { Upload } from 'lucide-react';

interface FileDropZoneProps {
  onFileContent: (content: string, filename: string) => void;
  accept?: string;
}

const ACCEPTED = '.txt,.md,.vtt,.srt,.csv';

export function FileDropZone({ onFileContent, accept = ACCEPTED }: FileDropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onFileContent(reader.result, file.name);
      }
    };
    reader.readAsText(file);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  };

  const onDragOver = (e: DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        dragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-muted-foreground/40'
      }`}
    >
      <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        Drop a file here, or <span className="text-primary font-medium">browse</span>
      </p>
      <p className="text-[10px] text-muted-foreground/60 mt-1">
        .txt, .md, .vtt, .srt, .csv
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) readFile(file);
        }}
      />
    </div>
  );
}
