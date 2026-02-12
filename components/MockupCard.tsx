
import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { RedoIcon } from './icons/RedoIcon';
import { Spinner } from './Spinner';

interface MockupCardProps {
  imageSrc: string;
  isLoading: boolean;
  onRemake: () => void;
}

export const MockupCard: React.FC<MockupCardProps> = ({ imageSrc, isLoading, onRemake }) => {
  const fullImageSrc = `data:image/png;base64,${imageSrc}`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fullImageSrc;
    link.download = `mockup-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden group">
      <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
        {isLoading ? (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <Spinner />
          </div>
        ) : (
          <img src={fullImageSrc} alt="Generated Mockup" className="object-cover w-full h-full" />
        )}
      </div>
      <div className="p-4 bg-gray-50 flex justify-end space-x-2">
        <button
          onClick={handleDownload}
          disabled={isLoading}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <DownloadIcon className="w-4 h-4 mr-2" />
          Download
        </button>
        <button
          onClick={onRemake}
          disabled={isLoading}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          <RedoIcon className="w-4 h-4 mr-2" />
          Remake
        </button>
      </div>
    </div>
  );
};
