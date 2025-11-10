import React from 'react';
import { Image, X } from 'lucide-react';

type PostComposerProps = {
  content: string;
  onChangeContent: (v: string) => void;
  category: string;
  onChangeCategory: (v: string) => void;
  categories: Array<{ id: string; label: string }>;
  images: string[];
  onAddImages: (files: FileList) => void;
  onRemoveImage: (index: number) => void;
  onSubmit: () => void;
  uploading?: boolean;
  canSubmit?: boolean;
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
};

const PostComposer: React.FC<PostComposerProps> = ({ content, onChangeContent, category, onChangeCategory, categories, images, onAddImages, onRemoveImage, onSubmit, uploading, canSubmit = true, fileInputRef }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <select value={category} onChange={(e) => onChangeCategory(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent flex-1 min-w-0">
            {categories.map(option => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </div>
        <textarea value={content} onChange={(e) => onChangeContent(e.target.value)} placeholder="Share something with your community..." className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base" rows={4} />
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {images.map((url, index) => (
              <div key={index} className="relative">
                <img src={url} alt={`Upload ${index + 1}`} className="w-full h-20 sm:h-24 object-cover rounded-lg" />
                <button onClick={() => onRemoveImage(index)} className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          <div className="flex items-center space-x-2">
            <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && onAddImages(e.target.files)} accept="image/*" multiple className="hidden" />
            <button onClick={() => fileInputRef?.current?.click()} disabled={uploading} className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50">
              {uploading ? <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div> : <Image className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            <span className="text-xs sm:text-sm text-gray-500">{uploading ? 'Uploading...' : 'Add photos'}</span>
          </div>
          <button onClick={onSubmit} disabled={!canSubmit} className="px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base w-full sm:w-auto">Post</button>
        </div>
      </div>
    </div>
  );
};

export default PostComposer;


