import React, { useState } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { 
  ArrowLeft, 
  CheckCircle, 
  BookOpen, 
  ChevronRight,
  ChevronLeft,
  Download,
  ExternalLink,
  PlayCircle,
  FileText
} from 'lucide-react';
import { useCourseContent } from '../hooks/useCourseContent';
import { Course, Lesson } from '../types';

interface CourseLearningViewProps {
  courseId: string;
  onBack: () => void;
  course?: Course | null;
  loading?: boolean;
}

const CourseLearningView: React.FC<CourseLearningViewProps> = ({ 
  courseId, 
  onBack,
  course: propCourse,
  loading: propLoading
}) => {
  // Use hook if props not provided (for backward compatibility)
  const hookData = useCourseContent(courseId);
  const course = propCourse ?? hookData.course;
  const loading = propLoading ?? hookData.loading;
  const { isDarkMode } = useTheme();

  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [lessonProgress, setLessonProgress] = useState<{ [key: string]: boolean }>({});

  const saveProgress = (lessonId: string, completed: boolean) => {
    const newProgress = { ...lessonProgress, [lessonId]: completed };
    setLessonProgress(newProgress);
    localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(newProgress));
  };

  const getCurrentLesson = (): Lesson | null => {
    if (!course?.modules || !course.modules[currentModuleIndex]) return null;
    const currentModule = course.modules[currentModuleIndex];
    return currentModule.lessons?.[currentLessonIndex] || null;
  };

  const getAllLessons = (): { lesson: Lesson; moduleIndex: number; lessonIndex: number }[] => {
    if (!course?.modules) return [];
    const allLessons: { lesson: Lesson; moduleIndex: number; lessonIndex: number }[] = [];
    course.modules.forEach((module, moduleIndex) => {
      module.lessons?.forEach((lesson, lessonIndex) => {
        allLessons.push({ lesson, moduleIndex, lessonIndex });
      });
    });
    return allLessons;
  };

  const getCompletedLessonsCount = (): number => {
    return Object.values(lessonProgress).filter(Boolean).length;
  };

  const getTotalLessonsCount = (): number => {
    return getAllLessons().length;
  };

  const getProgressPercentage = (): number => {
    const total = getTotalLessonsCount();
    const completed = getCompletedLessonsCount();
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const navigateToLesson = (moduleIndex: number, lessonIndex: number) => {
    setCurrentModuleIndex(moduleIndex);
    setCurrentLessonIndex(lessonIndex);
  };

  const nextLesson = () => {
    const allLessons = getAllLessons();
    const currentGlobalIndex = allLessons.findIndex(
      item => item.moduleIndex === currentModuleIndex && item.lessonIndex === currentLessonIndex
    );
    
    if (currentGlobalIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentGlobalIndex + 1];
      navigateToLesson(nextLesson.moduleIndex, nextLesson.lessonIndex);
    }
  };

  const prevLesson = () => {
    const allLessons = getAllLessons();
    const currentGlobalIndex = allLessons.findIndex(
      item => item.moduleIndex === currentModuleIndex && item.lessonIndex === currentLessonIndex
    );
    
    if (currentGlobalIndex > 0) {
      const prevLesson = allLessons[currentGlobalIndex - 1];
      navigateToLesson(prevLesson.moduleIndex, prevLesson.lessonIndex);
    }
  };

  const markAsComplete = () => {
    const currentLesson = getCurrentLesson();
    if (currentLesson) {
      saveProgress(currentLesson.id, true);
    }
  };

  const getYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getVimeoVideoId = (url: string): string | null => {
    const regex = /(?:vimeo\.com\/)([0-9]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getEmbedUrl = (url: string): string => {
    const youtubeId = getYouTubeVideoId(url);
    if (youtubeId) {
      return `https://www.youtube.com/embed/${youtubeId}`;
    }
    
    const vimeoId = getVimeoVideoId(url);
    if (vimeoId) {
      return `https://player.vimeo.com/video/${vimeoId}`;
    }
    
    return url;
  };

  const getVideoSource = (url: string): string => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'YouTube';
    }
    if (url.includes('vimeo.com')) {
      return 'Vimeo';
    }
    return 'Video';
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📃';
      case 'ppt':
      case 'pptx':
        return '📊';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'zip':
      case 'rar':
        return '🗜️';
      default:
        return '📁';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-2 ${isDarkMode ? 'border-purple-400 border-t-transparent' : 'border-purple-600 border-t-transparent'}`}></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Course not found</h3>
          <button onClick={onBack} className={`${isDarkMode ? 'text-purple-300 hover:text-purple-200' : 'text-purple-600 hover:text-purple-700'}`}>
            Go back
          </button>
        </div>
      </div>
    );
  }

  const currentLesson = getCurrentLesson();
  const allLessons = getAllLessons();
  const currentGlobalIndex = allLessons.findIndex(
    item => item.moduleIndex === currentModuleIndex && item.lessonIndex === currentLessonIndex
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className={`flex items-center transition-colors ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Courses
            </button>
            <div>
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{course.title}</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {course.modules?.length || 0} modules • {getTotalLessonsCount()} lessons
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Lesson {currentGlobalIndex + 1} of {getTotalLessonsCount()}
            </div>
            <div className={`w-32 rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{getProgressPercentage()}%</span>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Course Content */}
        <div className={`w-80 h-screen overflow-y-auto ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-r`}>
          <div className="p-6">
            <h2 className={`font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Course Content</h2>
            <div className="space-y-4">
              {course.modules?.map((module, moduleIndex) => (
                <div key={module.id} className={`rounded-lg border ${isDarkMode ? 'border-gray-700 bg-transparent' : 'border-gray-200 bg-white'}`}>
                  <div className={`p-4 border-b ${isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <h3 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{module.title}</h3>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {module.lessons?.length || 0} lessons
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    {module.lessons?.map((lesson, lessonIndex) => {
                      const isCurrentLesson = moduleIndex === currentModuleIndex && lessonIndex === currentLessonIndex;
                      const isCompleted = lessonProgress[lesson.id];
                      
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => navigateToLesson(moduleIndex, lessonIndex)}
                          className={`w-full text-left p-4 rounded-md transition-colors ${
                            isCurrentLesson
                              ? (isDarkMode ? 'bg-gray-800 border-l-4 border-purple-500' : 'bg-purple-50 border-l-4 border-purple-500')
                              : (isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50')
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isCompleted
                                ? 'bg-green-500 text-white' 
                                : isCurrentLesson
                                  ? 'bg-purple-500 text-white'
                                : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600')
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : lesson.video_url ? (
                                <PlayCircle className="w-4 h-4" />
                              ) : (
                                <FileText className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-medium text-sm ${
                                isCurrentLesson ? (isDarkMode ? 'text-purple-300' : 'text-purple-900') : (isDarkMode ? 'text-gray-100' : 'text-gray-900')
                              }`}>
                                {lesson.title}
                              </h4>
                              <div className="flex items-center space-x-2 mt-1">
                                {lesson.video_url && (
                                  <span className={`text-xs ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                                    {getVideoSource(lesson.video_url)}
                                  </span>
                                )}
                                {lesson.resource_files && lesson.resource_files.length > 0 && (
                                  <>
                                    {lesson.video_url && <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>•</span>}
                                    <span className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                                      {lesson.resource_files.length} Resource{lesson.resource_files.length > 1 ? 's' : ''}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {currentLesson ? (
            <div className="max-w-4xl mx-auto p-8">
              {/* Lesson Header */}
              <div className="mb-8">
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`${isDarkMode ? 'bg-purple-700/30 text-purple-200' : 'bg-purple-100 text-purple-800'} px-3 py-1 rounded-full text-sm font-medium`}>
                    Module {currentModuleIndex + 1}
                  </span>
                  <span className={`${isDarkMode ? 'bg-blue-700/30 text-blue-200' : 'bg-blue-100 text-blue-800'} px-3 py-1 rounded-full text-sm font-medium`}>
                    Lesson {currentLessonIndex + 1}
                  </span>
                </div>
                
                <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{currentLesson.title}</h1>
                <div className={`flex items-center space-x-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {currentLesson.video_url && (
                    <span>{getVideoSource(currentLesson.video_url)}</span>
                  )}
                  {lessonProgress[currentLesson.id] && (
                    <>
                      {currentLesson.video_url && <span>•</span>}
                      <span className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} font-medium`}>Completed</span>
                    </>
                  )}
                </div>
              </div>

              {/* Video Player */}
              {currentLesson.video_url && (
                <div className="bg-black rounded-xl overflow-hidden mb-8 shadow-xl ring-1 ring-white/10">
                  <div className="aspect-video">
                    <iframe
                      src={getEmbedUrl(currentLesson.video_url)}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={currentLesson.title}
                    />
                  </div>
                </div>
              )}

              {/* Lesson Content */}
              <div className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-8 mb-8`}>
                <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Lesson Overview</h2>
                
                {currentLesson.description && (
                  <div className="prose prose-lg max-w-none mb-6">
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>{currentLesson.description}</p>
                  </div>
                )}

                {currentLesson.additional_content && (
                  <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-6 mb-6`}>
                    <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Additional Notes</h3>
                    <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap`}>
                      {currentLesson.additional_content}
                    </div>
                  </div>
                )}

                {/* Resource Files */}
                {currentLesson.resource_files && currentLesson.resource_files.length > 0 && (
                  <div className={`pt-6 ${isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
                    <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Resource Files</h3>
                    <div className="grid gap-3">
                      {currentLesson.resource_files.map((file: any, index: number) => (
                        <div key={index} className={`${isDarkMode ? 'bg-blue-900/20 border-blue-900/30' : 'bg-blue-50 border-blue-200'} rounded-lg p-4 border`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">
                                {getFileIcon(file.originalName)}
                              </div>
                              <div>
                                <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{file.originalName}</h4>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {file.size && `${(file.size / 1024 / 1024).toFixed(2)} MB`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                              >
                                <ExternalLink className="w-4 h-4" />
                                <span>Open</span>
                              </a>
                              <a
                                href={file.url}
                                download={file.originalName}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                              >
                                <Download className="w-4 h-4" />
                                <span>Download</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={prevLesson}
                  disabled={currentGlobalIndex === 0}
                  className={`flex items-center px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Previous Lesson
                </button>

                <div className="flex items-center space-x-4">
                  {!lessonProgress[currentLesson.id] && (
                    <button
                      onClick={markAsComplete}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Mark as Complete
                    </button>
                  )}

                  <button
                    onClick={nextLesson}
                    disabled={currentGlobalIndex === allLessons.length - 1}
                    className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Lesson
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No lesson selected</h3>
                <p className="text-gray-600">Select a lesson from the sidebar to start learning</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseLearningView;