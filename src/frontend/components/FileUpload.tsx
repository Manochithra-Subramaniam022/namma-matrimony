'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, CheckCircle, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface FileUploadProps {
  label: string;
  subLabel?: string;
  accept?: string;
  maxSizeMB?: number;
  initialUrl?: string;
  onUploadSuccess: (url: string) => void;
  required?: boolean;
  watermarkText?: string;
  bucket?: string;
}

export function addWatermark(file: File, watermarkText = 'NAMMA MATRIMONY'): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) return resolve(file);

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Watermark styles
      const fontSize = Math.max(24, Math.floor(canvas.width / 18));
      ctx.font = `900 ${fontSize}px sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.40)';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = Math.max(1, fontSize / 20);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Rotate diagonally
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((-32 * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      const patternWidth = fontSize * 10;
      const patternHeight = fontSize * 4;

      for (let x = -canvas.width; x < canvas.width * 2; x += patternWidth) {
        for (let y = -canvas.height; y < canvas.height * 2; y += patternHeight) {
          ctx.fillText(watermarkText, x, y);
          ctx.strokeText(watermarkText, x, y);
        }
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: file.type }));
          } else {
            resolve(file);
          }
        },
        file.type,
        0.92
      );
    };

    img.onerror = () => resolve(file);
    img.src = url;
  });
}

export function FileUpload({
  label,
  subLabel = 'JPEG, PNG, PDF (Max 5MB)',
  accept = 'image/*,application/pdf',
  maxSizeMB = 5,
  initialUrl,
  onUploadSuccess,
  required = false,
  watermarkText = 'NAMMA MATRIMONY',
  bucket,
}: FileUploadProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(initialUrl || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialUrl && initialUrl !== fileUrl) {
      setFileUrl(initialUrl);
    }
  }, [initialUrl]);

  const handleFile = async (selectedFile: File) => {
    setError(null);
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds maximum limit of ${maxSizeMB}MB`);
      return;
    }

    setIsProcessing(true);
    try {
      let finalFile = selectedFile;
      if (selectedFile.type.startsWith('image/')) {
        finalFile = await addWatermark(selectedFile, watermarkText);
      }

      let uploadedUrl = '';

      if (bucket) {
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 7);
        const cleanName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${timestamp}_${randomSuffix}_${cleanName}`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from(bucket)
          .upload(filePath, finalFile, {
            cacheControl: '3600',
            upsert: true,
            contentType: finalFile.type || selectedFile.type,
          });

        if (uploadErr) {
          console.warn(`Supabase Storage upload to [${bucket}] failed:`, uploadErr);
          if (
            uploadErr.message?.includes('row-level security') ||
            (uploadErr as any).statusCode === 403 ||
            (uploadErr as any).statusCode === '403'
          ) {
            setError(
              `Bucket "${bucket}" policy required in Supabase SQL editor. Using local preview for now.`
            );
          } else {
            setError(uploadErr.message || `Upload to ${bucket} failed`);
          }
        } else if (uploadData) {
          const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(filePath);
          uploadedUrl = pubData.publicUrl;
        }
      }

      if (uploadedUrl) {
        setFileUrl(uploadedUrl);
        setFileName(finalFile.name);
        onUploadSuccess(uploadedUrl);
        setIsProcessing(false);
      } else {
        // Fallback to local Data URL (e.g., if no bucket or RLS policy pending)
        const reader = new FileReader();
        reader.onload = (e) => {
          const resultUrl = e.target?.result as string;
          setFileUrl(resultUrl);
          setFileName(finalFile.name);
          onUploadSuccess(resultUrl);
          setIsProcessing(false);
        };
        reader.onerror = () => {
          setError('Failed to read file preview');
          setIsProcessing(false);
        };
        reader.readAsDataURL(finalFile);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to process file');
      setIsProcessing(false);
    }
  };

  const handleRemove = () => {
    setFileUrl(null);
    setFileName(null);
    setError(null);
    onUploadSuccess('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const isImage = fileUrl
    ? fileUrl.startsWith('data:image') ||
      /\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i.test(fileUrl)
    : false;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <label
          className={`text-xs font-bold text-gray-700 uppercase tracking-wide ${
            required ? "after:content-['*'] after:ml-1 after:text-primary" : ''
          }`}
        >
          {label}
        </label>
        {subLabel && <span className="text-[11px] text-gray-400 font-medium">{subLabel}</span>}
      </div>

      {fileUrl ? (
        <div className="relative border-2 border-primary/20 bg-primary/5 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3 overflow-hidden">
            {isImage ? (
              <img
                src={fileUrl}
                alt="Upload preview"
                className="w-14 h-14 object-cover rounded-xl border border-[#D4AF37]/50 shadow-xs"
              />
            ) : (
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center border border-primary/20 text-primary">
                <FileText className="w-7 h-7" />
              </div>
            )}
            <div className="truncate">
              <p className="text-xs font-bold text-gray-800 truncate">{fileName || 'File Attached'}</p>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                <CheckCircle className="w-3.5 h-3.5" /> Ready & Protected
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
            title="Remove file"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-primary/25 hover:border-primary/60 bg-[#FFFDF9] hover:bg-white rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 group flex flex-col items-center justify-center gap-2"
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2 text-primary">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
              <span className="text-xs font-bold">
                {bucket ? 'Watermarking & Uploading to Cloud...' : 'Applying Protective Watermark...'}
              </span>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-primary transition-colors">
                  Click to upload or drag & drop
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Protected with client-side watermark</p>
              </div>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 font-medium mt-1.5">{error}</p>}
    </div>
  );
}
