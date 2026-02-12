
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { MockupCard } from './components/MockupCard';
import { Spinner } from './components/Spinner';
import { MOCKUP_CATEGORIES } from './constants';
import type { MockupCategory } from './types';
import { generateMockups } from './services/geminiService';

const App: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<{ file: File; base64: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MockupCategory | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remakingIndex, setRemakingIndex] = useState<number | null>(null);

  const handleImageUpload = (file: File, base64: string) => {
    setUploadedImage({ file, base64 });
    setGeneratedImages([]);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!uploadedImage || !selectedCategory) {
      setError('Please upload an image and select a category.');
      return;
    }

    setIsLoading(true);
    setGeneratedImages([]);
    setError(null);

    try {
      const results = await generateMockups({
        image: uploadedImage.base64,
        mimeType: uploadedImage.file.type,
        category: selectedCategory.name,
        prompt: customPrompt,
        count: 4,
      });
      setGeneratedImages(results);
    } catch (err) {
      console.error(err);
      setError('Failed to generate mockups. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemake = useCallback(async (indexToRemake: number) => {
    if (!uploadedImage || !selectedCategory) return;
    
    setRemakingIndex(indexToRemake);
    setError(null);
    try {
      const [newImage] = await generateMockups({
        image: uploadedImage.base64,
        mimeType: uploadedImage.file.type,
        category: selectedCategory.name,
        prompt: customPrompt,
        count: 1,
      });

      setGeneratedImages(prevImages => {
        const newImages = [...prevImages];
        if (newImage) {
            newImages[indexToRemake] = newImage;
        }
        return newImages;
      });

    } catch (err) {
      console.error(err);
      setError(`Failed to remake mockup #${indexToRemake + 1}.`);
    } finally {
      setRemakingIndex(null);
    }
  }, [uploadedImage, selectedCategory, customPrompt]);


  const isGenerationDisabled = !uploadedImage || !selectedCategory || isLoading;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-5xl mb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 tracking-tight">AI Mockup Generator</h1>
        <p className="mt-2 text-lg text-gray-500">Transform your designs into stunning, realistic mockups in seconds.</p>
      </header>

      <main className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-8">
        {/* Step 1: Upload Image */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-1"><span className="text-indigo-600 font-bold">1.</span> Upload your design</h2>
          <p className="text-sm text-gray-500 mb-4">Upload a PNG image with a transparent background for the best results.</p>
          <ImageUploader onImageUpload={handleImageUpload} />
        </div>

        {/* Step 2: Choose Category */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-1"><span className="text-indigo-600 font-bold">2.</span> Choose a context</h2>
          <p className="text-sm text-gray-500 mb-4">Select where you want to apply your design.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {MOCKUP_CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all duration-200 aspect-square ${
                  selectedCategory?.id === category.id
                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500'
                    : 'border-gray-200 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50'
                }`}
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <span className="text-sm font-medium text-center text-gray-700">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Optional Prompt */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-1"><span className="text-indigo-600 font-bold">3.</span> Refine the style (Optional)</h2>
          <p className="text-sm text-gray-500 mb-4">Describe the desired style. e.g., "minimalist, wooden table, natural light".</p>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g., on a dark t-shirt, outdoor setting, office environment..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            rows={2}
          />
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleGenerate}
            disabled={isGenerationDisabled}
            className={`w-full flex items-center justify-center text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 ${
              isGenerationDisabled
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
          >
            {isLoading ? <Spinner /> : 'Generate 4 Mockups'}
          </button>
          {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
        </div>
      </main>

      {(isLoading || generatedImages.length > 0) && (
        <section className="w-full max-w-5xl mt-12">
          <h2 className="text-3xl font-bold text-center mb-8">Your Mockups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {isLoading && generatedImages.length === 0 ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-gray-200 rounded-lg animate-pulse aspect-square"></div>
              ))
            ) : (
              generatedImages.map((imgSrc, index) => (
                <MockupCard
                  key={index}
                  imageSrc={imgSrc}
                  isLoading={remakingIndex === index}
                  onRemake={() => handleRemake(index)}
                />
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default App;
