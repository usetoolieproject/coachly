import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateLessonModalProps {
  lesson?: any;
  onSave: (lessonData: any) => void;
  onCancel: () => void;
}

const CreateLessonModal: React.FC<CreateLessonModalProps> = ({ lesson, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: lesson?.title || '',
    description: lesson?.description || '',
    videoUrl: lesson?.video_url || '',
    duration: lesson?.duration || 0,
    resourceUrl: lesson?.resource_url || '',
    additionalContent: lesson?.additional_content || '',
    allowPreview: lesson?.allow_preview || false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Lesson title is required');
      return;
    }

    // Convert duration to seconds if entered in minutes:seconds format
    let durationInSeconds = formData.duration;
    if (typeof formData.duration === 'string') {
      const parts = formData.duration.split(':');
      if (parts.length === 2) {
        durationInSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
      } else {
        durationInSeconds = parseInt(formData.duration) || 0;
      }
    }

    const lessonData = {
      ...formData,
      duration: durationInSeconds
    };

    onSave(lessonData);
  };

  const formatDurationForInput = (seconds: number) => {
    if (seconds === 0) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {lesson ? 'Edit Lesson' : 'Add New Lesson'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Lesson Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter lesson title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Describe what students will learn in this lesson"
            />
          </div>

          {/* Video URL and Duration */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL (Optional)
              </label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
              />
              <p className="text-sm text-gray-500 mt-1">YouTube, Vimeo, etc.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <input
                type="text"
                name="duration"
                value={formatDurationForInput(formData.duration)}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="5:30 or 330 (seconds)"
              />
              <p className="text-sm text-gray-500 mt-1">Format: MM:SS or seconds</p>
            </div>
          </div>

          {/* Resource URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource URL (Optional)
            </label>
            <input
              type="url"
              name="resourceUrl"
              value={formData.resourceUrl}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="https://example.com/lesson-resources.pdf"
            />
            <p className="text-sm text-gray-500 mt-1">Links to PDFs, code files, etc.</p>
          </div>

          {/* Additional Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Content (Optional)
            </label>
            <textarea
              name="additionalContent"
              value={formData.additionalContent}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Additional notes, transcript, key points, etc."
            />
          </div>

          {/* Allow Preview */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="allowPreview"
              id="allowPreview"
              checked={formData.allowPreview}
              onChange={handleInputChange}
              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="allowPreview" className="ml-2 text-sm text-gray-700">
              Allow preview (students can watch without enrolling)
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
            >
              {lesson ? 'Save Changes' : 'Add Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLessonModal;