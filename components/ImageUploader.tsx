
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageUpload: (file: File, base64: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type !== 'image/png') {
        setError('Only PNG files are accepted.');
        setPreview(null);
        return;
      }
      
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        if (base64String) {
            setPreview(reader.result as string);
            onImageUpload(file, base64String);
        } else {
            setError('Could not read the file.');
        }
      };
      reader.onerror = () => {
        setError('Error reading file.');
      }
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    handleFileChange(e.dataTransfer.files);
  };

  return (
    <div>
      <label
        htmlFor="file-upload"
        className={`flex justify-center w-full h-48 px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer transition-colors ${preview ? '' : 'hover:border-indigo-400 hover:bg-gray-50'}`}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {preview ? (
          <img src={preview} alt="Image preview" className="object-contain h-full" />
        ) : (
          <div className="space-y-1 text-center">
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <p className="pl-1">
                <span className="font-semibold text-indigo-600">Upload a file</span> or drag and drop
              </p>
            </div>
            <p className="text-xs text-gray-500">PNG up to 10MB</p>
          </div>
        )}
        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png" onChange={(e) => handleFileChange(e.target.files)} />
      </label>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};
