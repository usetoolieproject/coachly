import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CommunityMedia } from '../types';

type ImageModalProps = {
  images: CommunityMedia[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
};

const ImageModal: React.FC<ImageModalProps> = ({ images, currentIndex, isOpen, onClose, onNext, onPrev }) => {
  if (!isOpen || !images.length) return null;
  const currentImage = images[currentIndex];
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 shadow-2xl rounded-xl max-w-3xl w-full max-h-[80vh] relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-60 bg-white rounded-full p-1">
          <X className="w-6 h-6" />
        </button>
        {images.length > 1 && (
          <div className="absolute top-4 left-4 text-gray-700 bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm z-60">
            {currentIndex + 1} / {images.length}
          </div>
        )}
        {images.length > 1 && currentIndex > 0 && (
          <button onClick={onPrev} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-gray-900 bg-white bg-opacity-90 p-2 rounded-full z-60">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {images.length > 1 && currentIndex < images.length - 1 && (
          <button onClick={onNext} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-gray-900 bg-white bg-opacity-90 p-2 rounded-full z-60">
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
        <div className="p-6">
          <img src={currentImage.media_url} alt={`Image ${currentIndex + 1}`} className="w-full h-auto max-h-[70vh] object-contain rounded-lg" />
        </div>
        {images.length > 1 && (
          <div className="flex space-x-2 p-4 bg-gray-50 rounded-b-xl overflow-x-auto">
            {images.map((image, index) => (
              <div key={image.id} className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 ${index === currentIndex ? 'border-purple-500' : 'border-transparent'}`}>
                <img src={image.media_url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};

export default ImageModal;


