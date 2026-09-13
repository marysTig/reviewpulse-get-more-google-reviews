import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadToCloudinary, cloudinaryUrl } from "@/lib/cloudinary";

interface ImageUploadProps {
  /** Current image URL (if already uploaded) */
  value?: string;
  /** Called with the new secure Cloudinary URL after upload */
  onChange: (url: string) => void;
  /** Label shown above the upload area */
  label?: string;
  /** Cloudinary folder to store uploads in */
  folder?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "Business logo",
  folder = "fiverate/logos",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayUrl = value
    ? cloudinaryUrl(value, { width: 200, height: 200, crop: "fill", quality: "auto" })
    : null;

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be smaller than 10 MB.");
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const result = await uploadToCloudinary(file, folder);
      onChange(result.secureUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleRemove() {
    onChange("");
  }

  return (
    <div>
      <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">
        {label}
      </span>

      <div className="mt-2">
        {displayUrl ? (
          /* Preview of uploaded image */
          <div className="flex items-center gap-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-line">
              <img
                src={displayUrl}
                alt="Business logo"
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-ink/70 text-on-dark transition-colors hover:bg-red-600"
                title="Remove image"
              >
                <X className="size-3" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="rounded-md border border-line bg-paper px-3 py-2 text-xs font-medium text-ink transition-colors hover:border-ink/30 disabled:opacity-50"
            >
              {uploading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="size-3 animate-spin" />
                  Uploading…
                </span>
              ) : (
                "Change image"
              )}
            </button>
          </div>
        ) : (
          /* Upload drop zone */
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => !uploading && inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-paper px-6 py-8 transition-colors hover:border-pulse/50 hover:bg-pulse-soft/10 ${uploading ? "cursor-not-allowed opacity-60" : ""}`}
          >
            {uploading ? (
              <Loader2 className="size-6 animate-spin text-pulse" />
            ) : (
              <Upload className="size-6 text-ink-muted" />
            )}
            <div className="text-center">
              <p className="text-sm font-medium text-ink">
                {uploading ? "Uploading…" : "Click or drag to upload"}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">PNG, JPG, WebP · max 10 MB</p>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-2 text-xs text-red-600">{error}</p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
