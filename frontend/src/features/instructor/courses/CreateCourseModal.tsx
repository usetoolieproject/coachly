import React, { useState, useRef, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface CreateCourseModalProps {
  course?: any;
  onSave: (courseData: any) => Promise<void> | void;
  onCancel: () => void;
}

const CreateCourseModal: React.FC<CreateCourseModalProps> = ({ course, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    category: course?.category || 'technology',
    level: course?.level || 'beginner',
    type: course?.type || 'free',
    price: course?.price || 0,
    thumbnailUrl: course?.thumbnail_url || '',
    publishImmediately: course?.is_published || false
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(course?.thumbnail_url || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isDarkMode } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      level: 'beginner',
      type: 'free',
      price: 0,
      thumbnailUrl: '',
      publishImmediately: false,
      // 'category' removed from UI; if present upstream, ignore
      category: formData.category ?? 'technology',
    } as any);
    setThumbnailFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (course) {
      // sync fields when editing
      setFormData({
        title: course.title || '',
        description: course.description || '',
        level: course.level || 'beginner',
        type: course.type || 'free',
        price: course.price || 0,
        thumbnailUrl: course.thumbnail_url || '',
        publishImmediately: !!course.is_published,
        category: course.category || 'technology',
      });
      setPreviewUrl(course.thumbnail_url || '');
      setThumbnailFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      // entering create mode
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course]);

  const surface = isDarkMode
    ? 'bg-gray-800 text-gray-100 border-gray-700'
    : 'bg-white text-gray-900 border-gray-200';
  const headerBorder = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const labelText = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const mutedText = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const inputBase = `w-full p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent border ${
    isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;
  const selectBase = inputBase;
  const textareaBase = `${inputBase} resize-none`;
  const dropzoneBase = `border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
    isDarkMode ? 'border-gray-600 hover:border-purple-400/60' : 'border-gray-300 hover:border-purple-400'
  }`;
  const closeBtnHover = isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100';
  const cancelBtn = `px-6 py-2 border rounded-lg transition-colors ${
    isDarkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
  }`;
  const chooseFileBtn = `mt-2 px-4 py-2 rounded-lg transition-colors ${
    isDarkMode ? 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/40' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
  }`;
  const checkboxBase = `w-4 h-4 rounded focus:ring-purple-500 ${
    isDarkMode ? 'text-purple-400 bg-gray-700 border-gray-600' : 'text-purple-600 bg-gray-100 border-gray-300'
  }`;

  // Category selection removed per request

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (PNG, JPG, WEBP)');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setThumbnailFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      // Simulate file input change
      const input = fileInputRef.current;
      if (input) {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        handleFileSelect({ target: input } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!formData.title.trim()) {
      alert('Course title is required');
      return;
    }

    if (formData.type === 'paid' && formData.price <= 0) {
      alert('Please enter a valid price for paid courses');
      return;
    }

    // For now, we'll just use the preview URL as thumbnail_url
    // In a real app, you'd upload the file to a storage service first
    let thumbnailUrl = formData.thumbnailUrl;
    if (thumbnailFile && previewUrl) {
      thumbnailUrl = previewUrl; // In production, upload to storage and get URL
    }

    const courseData = {
      ...formData,
      thumbnailUrl,
      price: formData.type === 'paid' ? Number(formData.price) : 0
    };

    try {
      setIsSubmitting(true);
      await Promise.resolve(onSave(courseData));
      // keep disabled until modal closes (parent will close on success)
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50">
      <div className={`${surface} rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${headerBorder}`}>
          <h2 className="text-2xl font-bold">
            {course ? 'Edit Course' : 'Create New Course'}
          </h2>
          <button
            onClick={onCancel}
            className={`p-2 rounded-lg transition-colors ${closeBtnHover}`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Course Title */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${labelText}`}>
              Course Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={inputBase}
              placeholder="Enter course title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${labelText}`}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={textareaBase}
              placeholder="Describe what students will learn in this course"
            />
          </div>

          {/* Level */}
          <div className="grid gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${labelText}`}>
                Level *
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className={selectBase}
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Type and Price */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${labelText}`}>
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={selectBase}
                required
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            {formData.type === 'paid' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${labelText}`}>
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={inputBase}
                  placeholder="0.00"
                  required={formData.type === 'paid'}
                />
              </div>
            )}
          </div>

          {/* Course Thumbnail */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${labelText}`}>
              Course Thumbnail
              <span className={`ml-2 align-middle ${mutedText} text-xs`}>1280x720 (Optional)</span>
            </label>
            <div
              className={dropzoneBase}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Course thumbnail preview"
                    className="max-w-full h-32 mx-auto rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl('');
                      setThumbnailFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className={`w-8 h-8 mx-auto mb-2 ${mutedText}`} />
                  <p className={`${mutedText} mb-2`}>Drop an image here or click to browse</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>PNG, JPG, WEBP up to 5MB</p>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {!previewUrl && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={chooseFileBtn}
                >
                  Choose File
                </button>
              )}
            </div>
          </div>

          {/* Publish Immediately */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="publishImmediately"
              id="publishImmediately"
              checked={formData.publishImmediately}
              onChange={handleInputChange}
              className={checkboxBase}
            />
            <label htmlFor="publishImmediately" className={`ml-2 text-sm ${labelText}`}>
              Publish immediately (make visible to students)
            </label>
          </div>

          {/* Form Actions */}
          <div className={`flex items-center justify-end space-x-3 pt-6 border-t ${headerBorder}`}>
            <button
              type="button"
            onClick={() => {
              if (!course) resetForm();
              onCancel();
            }}
              className={cancelBtn}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg transition-all duration-300 text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {course ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;