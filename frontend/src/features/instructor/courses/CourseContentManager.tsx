// frontend/src/components/CourseContentManager.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { RefreshButton, UpdatingIndicator } from '../../../components/shared';
import { ArrowLeft, Plus, Edit, Trash2, FileText, Video, ExternalLink, BookOpen, Upload, X, MoreHorizontal, ChevronRight, ChevronDown, Folder, FolderOpen, File, Copy, Move } from 'lucide-react';
import { courseService, Course, Module, Lesson } from '../../student/studentCourses/services';
import CreateCourseModal from './CreateCourseModal';

interface CourseContentManagerProps {
  courseId: string;
  onBack: () => void;
}

const CourseContentManager: React.FC<CourseContentManagerProps> = ({ courseId, onBack }) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<{ [key: string]: boolean }>({});
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showMoveDropdown, setShowMoveDropdown] = useState<string | null>(null);
  
  // Editing states for inline editing (removed editContent)
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editAllowPreview, setEditAllowPreview] = useState(false);
  
  // Modal states - keeping your working modals
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [isModuleSubmitting, setIsModuleSubmitting] = useState(false);
  
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonAllowPreview, setLessonAllowPreview] = useState(false);
  const [resourceFiles, setResourceFiles] = useState<File[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);
  const [isLessonSubmitting, setIsLessonSubmitting] = useState(false);
  const [isInlineSaving, setIsInlineSaving] = useState(false);

  // Course edit modal
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);

  // Video modal for toolbar
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [tempVideoUrl, setTempVideoUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    loadCourseContent();
  }, [courseId]);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null);
      setShowMoveDropdown(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Update the loadCourseContent function to preserve selection
  const loadCourseContent = async () => {
    try {
      setLoading(true);
      const courseData = await courseService.getCourseContent(courseId);
      setCourse(courseData);
      
      const expanded: { [key: string]: boolean } = {};
      if (courseData.modules) {
        courseData.modules.forEach(module => {
          expanded[module.id] = true;
        });
        
        // Only set a new selected lesson if none is currently selected
        if (!selectedLessonId && courseData.modules[0]?.lessons?.[0]) {
          setSelectedLessonId(courseData.modules[0].lessons[0].id);
        }
      }
      setExpandedModules(expanded);
    } catch (error) {
      console.error('Error loading course content:', error);
      alert('Failed to load course content');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedLesson = (): Lesson | null => {
    if (!course?.modules || !selectedLessonId) return null;
    for (const module of course.modules) {
      const lesson = module.lessons?.find(l => l.id === selectedLessonId);
      if (lesson) return lesson;
    }
    return null;
  };

  const getModuleName = (): string => {
    const selectedLesson = getSelectedLesson();
    if (!selectedLesson || !course?.modules) return '';
    const module = course.modules.find(m => m.lessons?.some(l => l.id === selectedLesson.id));
    return module?.title || '';
  };

  // All your original working functions
  const resetModuleForm = () => {
    setModuleTitle('');
    setModuleDescription('');
    setEditingModule(null);
  };

  const resetLessonForm = () => {
    setLessonTitle('');
    setLessonDescription('');
    setLessonVideoUrl('');
    setLessonAllowPreview(false);
    setResourceFiles([]);
    setFilesToRemove([]);
    setEditingLesson(null);
    setSelectedModuleId(null);
  };

  const openCreateModuleModal = () => {
    resetModuleForm();
    setShowModuleModal(true);
    setOpenDropdown(null);
  };

  const openEditModuleModal = (module: Module) => {
    setEditingModule(module);
    setModuleTitle(module.title);
    setModuleDescription(module.description || '');
    setShowModuleModal(true);
    setOpenDropdown(null);
  };

  const openCreateLessonModal = (moduleId: string) => {
    resetLessonForm();
    setSelectedModuleId(moduleId);
    setShowLessonModal(true);
    setOpenDropdown(null);
  };

  const openEditLessonModal = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setSelectedModuleId(lesson.module_id);
    setLessonTitle(lesson.title);
    setLessonDescription(lesson.description || '');
    setLessonVideoUrl(lesson.video_url || '');
    setLessonAllowPreview(lesson.allow_preview);
    setResourceFiles([]);
    setShowLessonModal(true);
    setOpenDropdown(null);
  };

  const openEditCourseModal = () => {
    setShowEditCourseModal(true);
    setOpenDropdown(null);
  };

  const handleEditCourse = async (courseData: any) => {
    try {
      await courseService.updateCourse(courseId, courseData);
      setShowEditCourseModal(false);
      loadCourseContent();
    } catch (error: any) {
      console.error('Error updating course:', error);
      alert(error.message || 'Failed to update course');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });
    
    setResourceFiles(prev => [...prev, ...validFiles]);
  };

  // NEW: Handle file upload for inline editing
  const handleInlineFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const selectedLesson = getSelectedLesson();
    if (!selectedLesson) return;

    const validFiles = Array.from(files).filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    try {
      await courseService.updateLesson(selectedLesson.id, {
        title: selectedLesson.title,
        description: selectedLesson.description,
        videoUrl: selectedLesson.video_url,
        allowPreview: selectedLesson.allow_preview,
        resourceFiles: validFiles,
        filesToRemove: []
      });
      
      loadCourseContent();
    } catch (error: any) {
      console.error('Error uploading files:', error);
      alert(error.message || 'Failed to upload files');
    }
  };

  const removeFile = (index: number) => {
    setResourceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = (fileIndex: number) => {
    if (editingLesson && editingLesson.resource_files) {
      const fileToRemove = editingLesson.resource_files[fileIndex];
      setFilesToRemove(prev => [...prev, fileToRemove.fileName]);
      
      const updatedFiles = editingLesson.resource_files.filter((_, index) => index !== fileIndex);
      setEditingLesson({
        ...editingLesson,
        resource_files: updatedFiles
      });
    }
  };

  // NEW: Remove existing file for inline editing
  const removeExistingInlineFile = async (fileIndex: number) => {
    const selectedLesson = getSelectedLesson();
    if (!selectedLesson || !selectedLesson.resource_files) return;

    const fileToRemove = selectedLesson.resource_files[fileIndex];
    
    try {
      await courseService.updateLesson(selectedLesson.id, {
        title: selectedLesson.title,
        description: selectedLesson.description,
        videoUrl: selectedLesson.video_url,
        allowPreview: selectedLesson.allow_preview,
        resourceFiles: [],
        filesToRemove: [fileToRemove.fileName]
      });
      
      loadCourseContent();
    } catch (error: any) {
      console.error('Error removing file:', error);
      alert(error.message || 'Failed to remove file');
    }
  };

  // NEW: Remove video for inline editing
  const removeInlineVideo = async () => {
    const selectedLesson = getSelectedLesson();
    if (!selectedLesson) return;

    try {
      await courseService.updateLesson(selectedLesson.id, {
        title: selectedLesson.title,
        description: selectedLesson.description,
        videoUrl: '', // Empty string will be converted to null in backend
        allowPreview: selectedLesson.allow_preview,
        resourceFiles: [],
        filesToRemove: []
      });
      
      setEditVideoUrl('');
      loadCourseContent();
    } catch (error: any) {
      console.error('Error removing video:', error);
      alert(error.message || 'Failed to remove video');
    }
  };

  const handleCreateModule = async () => {
    if (!moduleTitle.trim()) {
      alert('Module title is required');
      return;
    }

    try {
      if (isModuleSubmitting) return;
      setIsModuleSubmitting(true);
      await courseService.createModule(courseId, {
        title: moduleTitle,
        description: moduleDescription
      });
      setShowModuleModal(false);
      resetModuleForm();
      loadCourseContent();
    } catch (error: any) {
      console.error('Error creating module:', error);
      alert(error.message || 'Failed to create module');
    } finally {
      setIsModuleSubmitting(false);
    }
  };

  const handleEditModule = async () => {
    if (!editingModule || !moduleTitle.trim()) {
      alert('Module title is required');
      return;
    }

    try {
      if (isModuleSubmitting) return;
      setIsModuleSubmitting(true);
      await courseService.updateModule(editingModule.id, {
        title: moduleTitle,
        description: moduleDescription
      });
      setShowModuleModal(false);
      resetModuleForm();
      loadCourseContent();
    } catch (error: any) {
      console.error('Error updating module:', error);
      alert(error.message || 'Failed to update module');
    } finally {
      setIsModuleSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module? All lessons in this module will also be deleted.')) {
      return;
    }

    try {
      await courseService.deleteModule(moduleId);
      loadCourseContent();
      setOpenDropdown(null);
    } catch (error: any) {
      console.error('Error deleting module:', error);
      alert(error.message || 'Failed to delete module');
    }
  };

  const handleDuplicateModule = async (moduleId: string) => {
    try {
      await courseService.duplicateModule(moduleId);
      loadCourseContent();
      setOpenDropdown(null);
    } catch (error: any) {
      console.error('Error duplicating module:', error);
      alert(error.message || 'Failed to duplicate module');
    }
  };

  const handleCreateLesson = async () => {
    if (!selectedModuleId || !lessonTitle.trim()) {
      alert('Lesson title is required');
      return;
    }

    try {
      if (isLessonSubmitting) return;
      setIsLessonSubmitting(true);
      const newLesson = await courseService.createLesson(selectedModuleId, {
        title: lessonTitle,
        description: lessonDescription,
        videoUrl: lessonVideoUrl,
        allowPreview: lessonAllowPreview,
        resourceFiles: resourceFiles
      });
      
      setShowLessonModal(false);
      resetLessonForm();
      setSelectedLessonId(newLesson.id);
      loadCourseContent();
    } catch (error: any) {
      console.error('Error creating lesson:', error);
      alert(error.message || 'Failed to create lesson');
    } finally {
      setIsLessonSubmitting(false);
    }
  };

  const handleEditLesson = async () => {
    if (!editingLesson || !lessonTitle.trim()) {
      alert('Lesson title is required');
      return;
    }

    try {
      if (isLessonSubmitting) return;
      setIsLessonSubmitting(true);
      await courseService.updateLesson(editingLesson.id, {
        title: lessonTitle,
        description: lessonDescription,
        videoUrl: lessonVideoUrl,
        allowPreview: lessonAllowPreview,
        resourceFiles: resourceFiles,
        filesToRemove: filesToRemove
      });
      
      setShowLessonModal(false);
      resetLessonForm();
      loadCourseContent();
    } catch (error: any) {
      console.error('Error updating lesson:', error);
      alert(error.message || 'Failed to update lesson');
    } finally {
      setIsLessonSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      await courseService.deleteLesson(lessonId);
      if (selectedLessonId === lessonId) {
        setSelectedLessonId(null);
      }
      loadCourseContent();
      setOpenDropdown(null);
    } catch (error: any) {
      console.error('Error deleting lesson:', error);
      alert(error.message || 'Failed to delete lesson');
    }
  };

  const handleDuplicateLesson = async (lessonId: string) => {
    try {
      const newLesson = await courseService.duplicateLesson(lessonId);
      setSelectedLessonId(newLesson.id);
      loadCourseContent();
      setOpenDropdown(null);
    } catch (error: any) {
      console.error('Error duplicating lesson:', error);
      alert(error.message || 'Failed to duplicate lesson');
    }
  };

  const handleMoveLesson = async (lessonId: string, newModuleId: string) => {
    try {
      await courseService.moveLessonToModule(lessonId, newModuleId);
      loadCourseContent();
      setShowMoveDropdown(null);
    } catch (error: any) {
      console.error('Error moving lesson:', error);
      alert(error.message || 'Failed to move lesson');
    }
  };

  const handleDeleteCourse = async () => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      await courseService.deleteCourse(courseId);
      onBack();
      setOpenDropdown(null);
    } catch (error: any) {
      console.error('Error deleting course:', error);
      alert(error.message || 'Failed to delete course');
    }
  };

  // Inline editing functions (removed additional content)
  const startEditing = () => {
    const selectedLesson = getSelectedLesson();
    if (selectedLesson) {
      setEditTitle(selectedLesson.title);
      setEditDescription(selectedLesson.description || '');
      setEditVideoUrl(selectedLesson.video_url || '');
      setEditAllowPreview(selectedLesson.allow_preview);
      setIsEditingLesson(true);
    }
  };

  const cancelEditing = () => {
    setIsEditingLesson(false);
    setEditTitle('');
    setEditDescription('');
    setEditVideoUrl('');
    setEditAllowPreview(false);
  };

  const saveInlineEdit = async () => {
    if (isInlineSaving) return;
    const selectedLesson = getSelectedLesson();
    if (!selectedLesson || !editTitle.trim()) {
      alert('Lesson title is required');
      return;
    }

    const currentSelectedLessonId = selectedLessonId; // Store current selection

    try {
      setIsInlineSaving(true);
      const updateData = {
        title: editTitle.trim(),
        description: editDescription.trim() || '',
        videoUrl: editVideoUrl.trim() || '',
        allowPreview: editAllowPreview,
        resourceFiles: [],
        filesToRemove: []
      };

      await courseService.updateLesson(selectedLesson.id, updateData);
      
      setIsEditingLesson(false);
      // Clear editing states
      setEditTitle('');
      setEditDescription('');
      setEditVideoUrl('');
      setEditAllowPreview(false);
      
      // Reload course content but preserve selection
      await loadCourseContent();
      
      // Restore the selected lesson
      if (currentSelectedLessonId) {
        setSelectedLessonId(currentSelectedLessonId);
      }
    } catch (error: any) {
      console.error('Error saving lesson:', error);
      alert(error.message || 'Failed to save lesson');
    } finally {
      setIsInlineSaving(false);
    }
  };

  const handleVideoAdd = () => {
    if (tempVideoUrl) {
      setEditVideoUrl(tempVideoUrl);
      setTempVideoUrl('');
      setShowVideoModal(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'doc': case 'docx': return '📃';
      case 'ppt': case 'pptx': return '📊';
      case 'jpg': case 'jpeg': case 'png': case 'gif': return '🖼️';
      case 'zip': case 'rar': return '🗜️';
      default: return '📁';
    }
  };

  const getEmbedUrl = (url: string): string => {
    if (url.includes('youtube.com/watch')) {
      return url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    } else if (url.includes('vimeo.com/')) {
      return url.replace('vimeo.com/', 'player.vimeo.com/video/');
    }
    return url;
  };

  if (loading && !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border rounded-lg px-6 py-4 shadow-sm`}>
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Courses</span>
            </button>
            <div className="flex items-center gap-2">
              <UpdatingIndicator isUpdating label="Loading…" />
              <RefreshButton onClick={loadCourseContent} className={`${isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700' : ''}`} />
            </div>
          </div>
        </div>
        <div className="p-6" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Course not found</h3>
            <button onClick={onBack} className="text-purple-600 hover:text-purple-700">Go back</button>
          </div>
        </div>
      </div>
    );
  }

  const selectedLesson = getSelectedLesson();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Modern Header - Single row layout */}
      <div className={`${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border rounded-lg px-4 sm:px-6 py-3 sm:py-4 shadow-sm mb-6`}>
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Left side: Back to Courses button */}
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-200 shadow-sm hover:shadow-md text-xs sm:text-sm"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="font-medium">Back to Courses</span>
          </button>
          
          {/* Right side: Updating indicator and Refresh button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5">
              <UpdatingIndicator isUpdating={loading} />
            </div>
            <RefreshButton 
              onClick={loadCourseContent} 
              className={`text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 ${isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700' : ''}`} 
            />
          </div>
        </div>
      </div>

      {/* CHANGED: Mobile-first responsive layout */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
        {/* Left Sidebar - File Tree - Mobile responsive */}
        <div className={`w-full lg:w-80 rounded-xl shadow-sm border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="p-5">
            {/* Course Title with Dropdown */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
              <div className="flex-1">
                <div className={`text-xs font-medium uppercase tracking-wider mb-1 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>Course</div>
                <h2 className={`text-lg font-semibold truncate pr-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{course.title}</h2>
              </div>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(openDropdown === 'course' ? null : 'course');
                  }}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:text-purple-300 hover:bg-gray-800' : 'hover:bg-purple-50 text-gray-500 hover:text-purple-600'}`}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                
                {openDropdown === 'course' && (
                  <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-lg z-[9999] border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <div className="py-2">
                      <button onClick={openEditCourseModal} className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-3 transition-colors ${isDarkMode ? 'text-gray-100 hover:bg-gray-800 hover:text-purple-300' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'}`}>
                        <Edit className="w-4 h-4" />
                        <span>Edit Course</span>
                      </button>
                      <button onClick={openCreateModuleModal} className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-3 transition-colors ${isDarkMode ? 'text-gray-100 hover:bg-gray-800 hover:text-purple-300' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'}`}>
                        <Plus className="w-4 h-4" />
                        <span>Add Module</span>
                      </button>
                      <button onClick={() => openCreateLessonModal(course.modules?.[0]?.id || '')} className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-3 transition-colors ${isDarkMode ? 'text-gray-100 hover:bg-gray-800 hover:text-purple-300' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'}`}>
                        <Plus className="w-4 h-4" />
                        <span>Add Lesson</span>
                      </button>
                      <div className={`border-t my-1 ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}></div>
                      <button onClick={handleDeleteCourse} className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-3 transition-colors ${isDarkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`}>
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Course</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* File Tree */}
            <div className="space-y-2">
              {course.modules && course.modules.length > 0 ? (
                course.modules.map((module) => (
                  <div key={module.id} className={`rounded-xl overflow-visible shadow-sm border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                    {/* Module Row */}
                    <div className={`flex items-center group transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <button
                        onClick={() => setExpandedModules(prev => ({ ...prev, [module.id]: !prev[module.id] }))}
                        className="flex items-center flex-1 py-3 px-4 text-sm"
                      >
                        <div className="w-5 h-5 mr-3 flex items-center justify-center">
                          {expandedModules[module.id] ? (
                            <ChevronDown className="w-4 h-4 text-purple-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                        <div className="w-5 h-5 mr-3">
                          {expandedModules[module.id] ? (
                            <FolderOpen className="w-5 h-5 text-purple-500" />
                          ) : (
                            <Folder className="w-5 h-5 text-purple-500" />
                          )}
                        </div>
                        <span className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} truncate font-medium`}>{module.title}</span>
                      </button>
                      
                      <div className="relative opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === `module-${module.id}` ? null : `module-${module.id}`);
                          }}
                          className="p-1.5 hover:bg-purple-100 text-gray-500 hover:text-purple-600 rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        
                        {openDropdown === `module-${module.id}` && (
                          <div className={`absolute right-0 top-full mt-1 w-48 rounded-xl shadow-lg z-[9999] border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                            <div className="py-2">
                              <button onClick={() => openEditModuleModal(module)} className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-3 transition-colors ${isDarkMode ? 'text-gray-200 hover:bg-gray-800 hover:text-purple-300' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'}`}>
                                <Edit className="w-4 h-4" />
                                <span>Edit Module</span>
                              </button>
                              <button onClick={() => openCreateLessonModal(module.id)} className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-3 transition-colors ${isDarkMode ? 'text-gray-200 hover:bg-gray-800 hover:text-purple-300' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'}`}>
                                <Plus className="w-4 h-4" />
                                <span>Add Lesson</span>
                              </button>
                              <button onClick={() => handleDuplicateModule(module.id)} className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-3 transition-colors ${isDarkMode ? 'text-gray-200 hover:bg-gray-800 hover:text-purple-300' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'}`}>
                                <Copy className="w-4 h-4" />
                                <span>Duplicate Module</span>
                              </button>
                              <div className={`my-1 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}></div>
                              <button onClick={() => handleDeleteModule(module.id)} className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-3 transition-colors ${isDarkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`}>
                                <Trash2 className="w-4 h-4" />
                                <span>Delete Module</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Lessons */}
                    {expandedModules[module.id] && (
                      <div className={`${isDarkMode ? 'border-t border-gray-800' : 'bg-gradient-to-b from-purple-50/30 to-white border-t border-gray-100'}`}>
                        {module.lessons?.map((lesson) => (
                          <div
                            key={lesson.id}
                            className={`flex items-center group ml-6 mr-3 my-2 rounded-lg cursor-pointer relative transition-all ${
                              selectedLessonId === lesson.id 
                                ? (isDarkMode ? 'bg-gray-800 border-l-4 border-purple-500 shadow-sm' : 'bg-purple-50 border-l-3 border-purple-500 shadow-sm') 
                                : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-white')
                            }`}
                            onClick={() => setSelectedLessonId(lesson.id)}
                          >
                            <div className="flex items-center flex-1 py-2.5 px-3 text-sm">
                              <File className={`w-4 h-4 mr-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-500'}`} />
                              <span className={`${isDarkMode ? 'text-gray-100' : 'text-gray-700'} truncate font-medium`}>{lesson.title}</span>
                              {lesson.video_url && <Video className={`w-4 h-4 ml-2 flex-shrink-0 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`} />}
                            </div>
                            
                            <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdown(openDropdown === `lesson-${lesson.id}` ? null : `lesson-${lesson.id}`);
                                }}
                                className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:text-purple-300 hover:bg-gray-700' : 'text-gray-500 hover:text-purple-600 hover:bg-purple-100'}`}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                              
                              {openDropdown === `lesson-${lesson.id}` && (
                                <div className={`absolute right-0 top-full mt-1 w-48 rounded-xl shadow-lg z-[9999] border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                                  <div className="py-2">
                                    <button onClick={() => openEditLessonModal(lesson)} className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-3 transition-colors ${isDarkMode ? 'text-gray-200 hover:bg-gray-800 hover:text-purple-300' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'}`}>
                                      <Edit className="w-4 h-4" />
                                      <span>Edit Lesson</span>
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMoveDropdown(showMoveDropdown === lesson.id ? null : lesson.id);
                                        setOpenDropdown(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 flex items-center space-x-3 transition-colors"
                                    >
                                      <Move className="w-4 h-4" />
                                      <span>Change Module</span>
                                    </button>
                                    <button onClick={() => handleDuplicateLesson(lesson.id)} className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-3 transition-colors ${isDarkMode ? 'text-gray-200 hover:bg-gray-800 hover:text-purple-300' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'}`}>
                                      <Copy className="w-4 h-4" />
                                      <span>Duplicate</span>
                                    </button>
                                    <div className={`my-1 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}></div>
                                    <button onClick={() => handleDeleteLesson(lesson.id)} className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-3 transition-colors ${isDarkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`}>
                                      <Trash2 className="w-4 h-4" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Move Dropdown */}
                              {showMoveDropdown === lesson.id && (
                                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-200 z-[9999]">
                                  <div className="py-2 px-4 border-b border-gray-100 text-xs font-medium text-purple-600 uppercase tracking-wider">Move to Module</div>
                                  <div className="py-1 max-h-32 overflow-y-auto">
                                    {course.modules?.map((targetModule) => (
                                      targetModule.id !== lesson.module_id && (
                                        <button
                                          key={targetModule.id}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleMoveLesson(lesson.id, targetModule.id);
                                          }}
                                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 flex items-center space-x-3 transition-colors"
                                        >
                                          <Folder className="w-4 h-4 text-purple-500" />
                                          <span className="truncate">{targetModule.title}</span>
                                        </button>
                                      )
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
                  <Folder className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-sm mb-4">No modules yet</p>
                  <button 
                    onClick={openCreateModuleModal} 
                    className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow-md"
                  >
                    Create your first module
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Content Area - Mobile responsive */}
        <div className={`flex-1 rounded-xl shadow-sm border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          {selectedLesson ? (
            <>
              {/* Lesson Header - Mobile responsive */}
              <div className={`px-4 sm:px-6 py-4 sm:py-5 rounded-t-xl border-b ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gradient-to-r from-purple-50/50 to-white border-gray-100'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                      <span className={`text-xs font-medium px-2 sm:px-3 py-1 rounded-full ${isDarkMode ? 'text-purple-300 bg-purple-900/30' : 'text-purple-600 bg-purple-100'}`}>
                        {getModuleName()}
                      </span>
                    </div>
                    {isEditingLesson ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 bg-transparent border-none outline-none w-full focus:ring-0 border-b-2 border-transparent focus:border-purple-500 transition-colors"
                        style={{ boxShadow: 'none' }}
                      />
                    ) : (
                      <h1 className={`text-lg sm:text-xl lg:text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} truncate`}>{selectedLesson.title}</h1>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    {isEditingLesson ? (
                      <>
                        {/* Mobile responsive buttons */}
                        <button
                          onClick={saveInlineEdit}
                          disabled={isInlineSaving}
                          className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md text-white text-sm sm:text-base ${isInlineSaving ? 'bg-blue-600/60 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Save Changes</span>
                          <span className="sm:hidden">Save</span>
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Cancel</span>
                          <span className="sm:hidden">Cancel</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={startEditing}
                        className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Edit</span>
                        <span className="sm:hidden">Edit</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Toolbar for adding content when editing - Mobile responsive */}
                {isEditingLesson && (
                  <div className={`flex flex-wrap items-center gap-2 sm:gap-3 pt-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <button 
                      onClick={() => setShowVideoModal(true)} 
                      className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium border ${isDarkMode ? 'border-purple-400 text-purple-300 hover:bg-gray-800' : 'border-purple-300 text-purple-600 hover:bg-purple-50'}`}
                    >
                      <Video className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Video</span>
                    </button>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium border ${isDarkMode ? 'border-purple-400 text-purple-300 hover:bg-gray-800' : 'border-purple-300 text-purple-600 hover:bg-purple-50'}`}
                    >
                      <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>File</span>
                    </button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => handleInlineFileUpload(e.target.files)}
                    />
                  </div>
                )}
              </div>

              {/* Lesson Content - Mobile responsive */}
              <div className="p-4 sm:p-6">
                <div className="max-w-4xl space-y-6 sm:space-y-8">
                  {/* Video First */}
                  {(isEditingLesson ? editVideoUrl : selectedLesson.video_url) && (
                    <div className="relative rounded-xl overflow-hidden shadow-lg group">
                      <div className="aspect-video">
                        <iframe
                          src={getEmbedUrl(isEditingLesson ? editVideoUrl : selectedLesson.video_url || '')}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={selectedLesson.title}
                        />
                      </div>
                      {isEditingLesson && (
                        <button
                          onClick={() => setEditVideoUrl('')}
                          className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                          title="Remove video (will be saved when you click Save)"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      {!isEditingLesson && selectedLesson.video_url && (
                        <button
                          onClick={removeInlineVideo}
                          className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          title="Remove video"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Description Below Video */}
                  {isEditingLesson ? (
                    <div className={`${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-purple-50/50 border-purple-100'} rounded-xl p-6 border`}>
                      <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-purple-700'}`}>Description</label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Add a description..."
                        className={`${isDarkMode ? 'w-full p-4 border border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-800 text-gray-100 placeholder-gray-400' : 'w-full p-4 border border-purple-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white'}`}
                        rows={4}
                      />
                    </div>
                  ) : (
                    selectedLesson.description && (
                      <div className={`${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-100'} rounded-xl p-6 border`}>
                        <h3 className={`text-lg font-semibold mb-3 flex items-center ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          <BookOpen className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`} />
                          Description
                        </h3>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>{selectedLesson.description}</p>
                      </div>
                    )
                  )}

                  {/* Resource Files */}
                  {selectedLesson.resource_files && selectedLesson.resource_files.length > 0 && (
                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-purple-600" />
                        Resources
                      </h3>
                      <div className="space-y-3">
                        {selectedLesson.resource_files.map((file: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-white border border-purple-200 rounded-lg group shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-4">
                              <div className="text-2xl">{getFileIcon(file.originalName)}</div>
                              <span className="text-purple-800 font-medium">{file.originalName}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:text-purple-700 p-2 hover:bg-purple-100 rounded-lg transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => removeExistingInlineFile(index)}
                                className="text-red-600 hover:text-red-700 p-2 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preview Toggle */}
                  {isEditingLesson && (
                    <div className={`${isDarkMode ? 'border-t border-gray-800' : 'border-t border-gray-100'} pt-6`}>
                      <label className={`flex items-center rounded-lg p-4 border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-purple-50 border-purple-100'}`}>
                        <input
                          type="checkbox"
                          checked={editAllowPreview}
                          onChange={(e) => setEditAllowPreview(e.target.checked)}
                          className={`${isDarkMode ? 'w-4 h-4 text-purple-400 bg-gray-800 border-gray-700 rounded focus:ring-purple-500' : 'w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500'}`}
                        />
                        <span className={`ml-3 text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-purple-700'}`}>
                          Allow preview (students can watch without enrolling)
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <BookOpen className="w-20 h-20 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a lesson</h3>
                <p className="text-gray-600">Choose a lesson from the sidebar to view its content</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Updated Modals with proper z-index */}
      {showModuleModal && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingModule ? 'Edit Module' : 'Add New Module'}
              </h2>
              <button
                onClick={() => {
                  setShowModuleModal(false);
                  resetModuleForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Module Title *</label>
                <input
                  type="text"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter module title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={moduleDescription}
                  onChange={(e) => setModuleDescription(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Describe what this module covers"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowModuleModal(false);
                    resetModuleForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingModule ? handleEditModule : handleCreateModule}
                  disabled={isModuleSubmitting}
                  className={`px-6 py-2 rounded-lg text-white transition-all duration-300 ${isModuleSubmitting ? 'bg-purple-600/60 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:shadow-lg'}`}
                >
                  {editingModule ? 'Save Changes' : 'Add Module'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Updated Lesson Modal (removed additional content) */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
              </h2>
              <button
                onClick={() => {
                  setShowLessonModal(false);
                  resetLessonForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Title *</label>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter lesson title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={lessonDescription}
                  onChange={(e) => setLessonDescription(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Describe what students will learn in this lesson"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video URL (Optional)</label>
                <input
                  type="url"
                  value={lessonVideoUrl}
                  onChange={(e) => setLessonVideoUrl(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="text-sm text-gray-500 mt-1">YouTube, Vimeo, etc.</p>
              </div>

              {/* Resource Files Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resource Files (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Upload resource files for this lesson</p>
                  <p className="text-sm text-gray-500 mb-4">Any file type (Max 10MB each)</p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resource-upload"
                  />
                  <label
                    htmlFor="resource-upload"
                    className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors cursor-pointer"
                  >
                    Choose Files
                  </label>
                </div>

                {/* Display selected files */}
                {resourceFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Selected Files:</p>
                    {resourceFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getFileIcon(file.name)}</span>
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Show existing files for editing */}
                {editingLesson && editingLesson.resource_files && editingLesson.resource_files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Current Files:</p>
                    {editingLesson.resource_files.map((file: any, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getFileIcon(file.originalName)}</span>
                          <span className="text-sm text-gray-700">{file.originalName}</span>
                          <span className="text-xs text-gray-500">
                            {file.size && `${(file.size / 1024 / 1024).toFixed(2)} MB`}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-500 hover:text-purple-700 p-1"
                            title="View file"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => removeExistingFile(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowPreview"
                  checked={lessonAllowPreview}
                  onChange={(e) => setLessonAllowPreview(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="allowPreview" className="ml-2 text-sm text-gray-700">
                  Allow preview (students can watch without enrolling)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowLessonModal(false);
                    resetLessonForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingLesson ? handleEditLesson : handleCreateLesson}
                  disabled={isLessonSubmitting}
                  className={`px-6 py-2 rounded-lg text-white transition-all duration-300 ${isLessonSubmitting ? 'bg-purple-600/60 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:shadow-lg'}`}
                >
                  {editingLesson ? 'Save Changes' : 'Add Lesson'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Edit Modal */}
      {showEditCourseModal && course && (
        <CreateCourseModal
          course={course}
          onSave={handleEditCourse}
          onCancel={() => setShowEditCourseModal(false)}
        />
      )}

      {/* Video Modal for Toolbar */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add Video</h2>
              <button onClick={() => setShowVideoModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                <input
                  type="url"
                  value={tempVideoUrl}
                  onChange={(e) => setTempVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowVideoModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVideoAdd}
                disabled={!tempVideoUrl}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                Add Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseContentManager;