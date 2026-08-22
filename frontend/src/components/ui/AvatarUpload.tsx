import React, { useRef, useState, useEffect } from 'react';
import { Camera, Trash2, RefreshCw, UploadCloud, AlertCircle } from 'lucide-react';

export interface AvatarUploadProps {
  value?: File | null;
  previewUrl?: string;
  onChange: (file: File | null, previewUrl?: string) => void;
  error?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  previewUrl,
  onChange,
  error,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [internalPreview, setInternalPreview] = useState<string | null>(previewUrl || null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (previewUrl !== undefined) {
      setInternalPreview(previewUrl || null);
    }
  }, [previewUrl]);

  const handleFile = (file: File) => {
    setLocalError(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setLocalError('Please upload a JPG, PNG, WEBP or GIF image.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setLocalError('Image size should be less than 5MB.');
      return;
    }

    // Clean up old object URL if it was created locally
    if (internalPreview && internalPreview.startsWith('blob:')) {
      URL.revokeObjectURL(internalPreview);
    }

    const objectUrl = URL.createObjectURL(file);
    setInternalPreview(objectUrl);
    onChange(file, objectUrl);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (internalPreview && internalPreview.startsWith('blob:')) {
      URL.revokeObjectURL(internalPreview);
    }
    setInternalPreview(null);
    setLocalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange(null, undefined);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleInputChange}
        className="sr-only"
        aria-label="Upload profile photo"
        tabIndex={-1}
      />

      <div className="relative group">
        <button
          type="button"
          onClick={triggerUpload}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          aria-label={internalPreview ? 'Change profile photo' : 'Upload profile photo'}
          className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 overflow-hidden cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#F4C95D]/40 ${
            internalPreview
              ? 'border-2 border-[#E5B740] shadow-md shadow-[#F4C95D]/20'
              : `border-2 border-dashed ${
                  isDragging
                    ? 'border-[#E3B443] bg-[#FCFAF5] scale-105'
                    : 'border-[#DAD4C7] hover:border-[#E5B740] bg-white/70 hover:bg-white'
                } shadow-inner`
          }`}
        >
          {internalPreview ? (
            <>
              <img
                src={internalPreview}
                alt="Profile Preview"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white p-1">
                <RefreshCw className="w-4 h-4 mb-0.5" />
                <span className="text-[10px] font-medium tracking-wide">Change</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-2 text-center">
              <div className="w-8 h-8 rounded-full bg-[#EFEBE3] flex items-center justify-center text-[#6F6A60] mb-1 group-hover:bg-[#F4C95D]/30 group-hover:text-[#252525] transition-colors">
                {isDragging ? <UploadCloud className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
              </div>
              <span className="text-[11px] font-semibold text-[#252525]">Add Photo</span>
            </div>
          )}
        </button>

        {internalPreview && (
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove profile photo"
            className="absolute bottom-0 right-0 p-1.5 bg-[#FAECE7] hover:bg-[#F5D5CB] text-[#D96B43] rounded-full border border-white shadow-sm transition-all duration-200 hover:scale-110"
            title="Remove photo"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2">
        <button
          type="button"
          onClick={triggerUpload}
          className="text-xs font-medium text-[#6F6A60] hover:text-[#252525] transition-colors cursor-pointer"
        >
          {internalPreview ? 'Change photo' : 'Upload photo'}
        </button>
        {internalPreview && (
          <>
            <span className="text-[#DAD4C7] text-xs">•</span>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs font-medium text-[#D96B43] hover:text-[#BF552F] transition-colors cursor-pointer"
            >
              Remove
            </button>
          </>
        )}
      </div>

      {(error || localError) && (
        <p role="alert" className="text-xs text-[#D96B43] flex items-center gap-1 mt-1.5 animate-in fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error || localError}</span>
        </p>
      )}
    </div>
  );
};
