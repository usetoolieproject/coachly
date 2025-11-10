import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  CheckCircle, 
  BookOpen, 
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Download,
  ExternalLink,
  Folder,
  FolderOpen,
  File,
  Video,
  Lock
} from 'lucide-react';
import { UpdatingIndicator, RefreshButton } from '../../../../components/shared';
import { useStudentCourse } from '../hooks/useStudentCourse';
import { StudentCourse } from '../types';
import { useTheme } from '../../../../contexts/ThemeContext';

interface StudentLearningViewProps {
  courseId: string;
  onBack: () => void;
  course?: StudentCourse | null;
  markLessonComplete?: (lessonId: string) => Promise<void>;
}

const StudentLearningView: React.FC<StudentLearningViewProps> = ({ 
  courseId, 
  onBack,
  course: propCourse,
  markLessonComplete: propMarkLessonComplete
}) => {
  // Use hook if props not provided (for backward compatibility)
  const hookData = useStudentCourse(courseId);
  const course = propCourse ?? hookData.course;
  const markLessonComplete = propMarkLessonComplete ?? hookData.markLessonComplete;
  const { isDarkMode } = useTheme();
  const isPaidCourse = (course?.type === 'paid');
  const isPaidAccess = (course as any)?.isPaid === true;
  const canAccessContent = !isPaidCourse || isPaidAccess;
  const handleSubscribeToCourse = hookData.handleSubscribeToCourse;
  const isSubscribing = hookData.isSubscribing;

  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [expandedModules, setExpandedModules] = useState<{ [key: string]: boolean }>({});
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Auto-expand all modules and set initial selection when course loads
  useEffect(() => {
    if (course?.modules) {
      const expanded: { [key: string]: boolean } = {};
      course.modules.forEach((module: any) => {
        expanded[module.id] = true;
      });
      
      // Set first lesson as selected if none is selected
      if (course.modules[0]?.lessons?.[0] && !selectedLessonId) {
        const firstLesson = course.modules[0].lessons[0];
        setSelectedLessonId(firstLesson.id);
        setCurrentModuleIndex(0);
        setCurrentLessonIndex(0);
      }
      setExpandedModules(expanded);
    }
  }, [course, selectedLessonId]);

  const getCurrentLesson = () => {
    if (!course?.modules || !selectedLessonId) return null;
    for (const module of course.modules) {
      const lesson = module.lessons?.find((l: any) => l.id === selectedLessonId);
      if (lesson) return lesson;
    }
    return null;
  };

  const getAllLessons = () => {
    if (!course?.modules) return [];
    const allLessons: { lesson: any; moduleIndex: number; lessonIndex: number }[] = [];
    course.modules.forEach((module: any, moduleIndex) => {
      module.lessons?.forEach((lesson: any, lessonIndex: number) => {
        allLessons.push({ lesson, moduleIndex, lessonIndex });
      });
    });
    return allLessons;
  };

  const getCompletedLessonsCount = () => {
    if (!course?.lessonProgress) return 0;
    return Object.values(course.lessonProgress).filter(progress => progress.completed).length;
  };

  const getTotalLessonsCount = () => {
    return getAllLessons().length;
  };

  const getProgressPercentage = () => {
    const total = getTotalLessonsCount();
    const completed = getCompletedLessonsCount();
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const isCourseCompleted = Boolean((course as any)?.completedAt) || getProgressPercentage() === 100;

  const navigateToLesson = (moduleIndex: number, lessonIndex: number, lessonId: string) => {
    setCurrentModuleIndex(moduleIndex);
    setCurrentLessonIndex(lessonIndex);
    setSelectedLessonId(lessonId);
  };

  const nextLesson = () => {
    const allLessons = getAllLessons();
    const currentGlobalIndex = allLessons.findIndex(
      item => item.lesson.id === selectedLessonId
    );
    
    if (currentGlobalIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentGlobalIndex + 1];
      navigateToLesson(nextLesson.moduleIndex, nextLesson.lessonIndex, nextLesson.lesson.id);
    }
  };

  const prevLesson = () => {
    const allLessons = getAllLessons();
    const currentGlobalIndex = allLessons.findIndex(
      item => item.lesson.id === selectedLessonId
    );
    
    if (currentGlobalIndex > 0) {
      const prevLesson = allLessons[currentGlobalIndex - 1];
      navigateToLesson(prevLesson.moduleIndex, prevLesson.lessonIndex, prevLesson.lesson.id);
    }
  };

  const markAsComplete = async () => {
    const currentLesson = getCurrentLesson();
    if (!currentLesson || updatingProgress) return;

    try {
      setUpdatingProgress(true);
      await markLessonComplete(currentLesson.id);
      // Optimistic UI update
      try {
        (course as any).lessonProgress = {
          ...(course as any).lessonProgress,
          [currentLesson.id]: {
            ...((course as any).lessonProgress?.[currentLesson.id] || {}),
            completed: true
          }
        };
      } catch {}
      // Soft-advance to next lesson if available
      nextLesson();
      // Trigger a background refetch to reconcile with server
      try { (hookData as any).refetch && (hookData as any).refetch(); } catch {}
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      alert('Failed to mark lesson as complete');
    } finally {
      setUpdatingProgress(false);
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

  // Loading/Skeleton state (avoid misleading "not found" during initial fetch)
  if ((hookData as any).loading && !course) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className={`px-6 py-4 flex items-center justify-between border-b ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className={`h-6 w-40 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className="flex items-center gap-3">
            <UpdatingIndicator isUpdating />
            <div className={`w-32 h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          </div>
        </div>
        <div className="flex h-[calc(100vh-73px)]">
          <div className={`w-80 p-4 space-y-4 border-r ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className={`h-6 w-48 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`h-8 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
            ))}
          </div>
          <div className="flex-1 p-8">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className={`h-8 w-72 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <div className={`h-64 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
              <div className={`h-40 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If still no course after loading, show the real empty state
  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Course not found</h3>
          <p className="text-gray-600 mb-4">You may not be enrolled in this course.</p>
          <button onClick={onBack} className="text-blue-600 hover:text-blue-700 font-medium">
            Go back
          </button>
        </div>
      </div>
    );
  }


  const currentLesson = getCurrentLesson();
  const allLessons = getAllLessons();
  const currentGlobalIndex = allLessons.findIndex(
    item => item.lesson.id === selectedLessonId
  );

  const rootBg = isDarkMode ? 'bg-gray-950' : 'bg-gray-50';
  const headerColors = isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const backBtnColors = isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900';
  const smallText = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const completedBadge = isDarkMode ? 'text-green-300 bg-green-900/30' : 'text-green-700 bg-green-100';
  const progressTrack = isDarkMode ? 'bg-gray-700' : 'bg-gray-200';
  const percentText = isDarkMode ? 'text-white' : 'text-gray-900';
  const sidebarColors = isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const titleBorder = isDarkMode ? 'border-gray-800' : 'border-gray-200';
  const titleText = isDarkMode ? 'text-white' : 'text-gray-900';
  const moduleRowHover = isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50';
  const chevronColor = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const moduleTitleText = isDarkMode ? 'text-gray-200' : 'text-gray-800';
  const lessonInactiveHover = isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50';
  const lessonCurrentBg = isDarkMode ? 'bg-blue-900/20 border-l-2 border-blue-500' : 'bg-blue-50 border-l-2 border-blue-500';
  const iconIdle = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const lessonTitle = isDarkMode ? 'text-gray-200' : 'text-gray-700';
  const countBadge = isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-600';
  const chipBlue = isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800';
  const chipGreen = isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800';
  const h1Color = isDarkMode ? 'text-white' : 'text-gray-900';
  const metaText = smallText;
  const completedText = isDarkMode ? 'text-green-300' : 'text-green-600';
  const contentPanel = isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const bodyText = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const notesBg = isDarkMode ? 'bg-gray-800' : 'bg-gray-50';
  const sectionTitle = isDarkMode ? 'text-white' : 'text-gray-900';
  const resourceCard = isDarkMode ? 'bg-blue-900/20 border-blue-900/30' : 'bg-blue-50 border-blue-200';
  const prevBtn = isDarkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200';

  return (
    <div className={`min-h-screen ${rootBg}`}>
      {/* Header - Mobile First Responsive */}
      <div className={`px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b ${headerColors}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          {/* Back Button - Mobile First */}
          <div className="flex items-center">
            <button
              onClick={onBack}
              className={`flex items-center transition-colors text-sm sm:text-base ${backBtnColors}`}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Back to My Courses</span>
              <span className="sm:hidden">Back</span>
            </button>
          </div>
          
          {/* Controls - Responsive Layout */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {/* Larger screens: Single row with updating indicator first */}
            <div className="hidden sm:flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <UpdatingIndicator isUpdating={(hookData as any).isUpdating} />
                {!canAccessContent ? (
                  <div className={`text-xs sm:text-sm ${smallText}`}>Payment required</div>
                ) : (
                  <div className={`text-xs sm:text-sm ${smallText}`}>
                    Lesson {currentGlobalIndex + 1} of {getTotalLessonsCount()}
                  </div>
                )}
                {isCourseCompleted && (
                  <span className={`inline-flex items-center gap-1 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full ${completedBadge}`}>
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Course Completed</span>
                    <span className="sm:hidden">Completed</span>
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-20 sm:w-32 rounded-full h-1.5 sm:h-2 ${progressTrack}`}>
                    <div 
                      className="bg-blue-600 h-1.5 sm:h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                  <span className={`text-xs sm:text-sm font-medium ${percentText}`}>{getProgressPercentage()}%</span>
                </div>
                <RefreshButton onClick={hookData.refetch} isRefreshing={(hookData as any).isUpdating} />
              </div>
            </div>
            
            {/* Smaller screens: Two rows layout */}
            <div className="flex sm:hidden flex-col gap-2">
              {/* Row 1: Lesson info, status, and progress */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {!canAccessContent ? (
                    <div className={`text-xs ${smallText}`}>Payment required</div>
                  ) : (
                    <div className={`text-xs ${smallText}`}>
                      Lesson {currentGlobalIndex + 1} of {getTotalLessonsCount()}
                    </div>
                  )}
                  {isCourseCompleted && (
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${completedBadge}`}>
                      <CheckCircle className="w-3 h-3" />
                      <span>Completed</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-20 rounded-full h-1.5 ${progressTrack}`}>
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                  <span className={`text-xs font-medium ${percentText}`}>{getProgressPercentage()}%</span>
                </div>
              </div>
              
              {/* Row 2: Refresh button and updating indicator */}
              <div className="flex items-center justify-between gap-2">
                <RefreshButton onClick={hookData.refetch} isRefreshing={(hookData as any).isUpdating} />
                <UpdatingIndicator isUpdating={(hookData as any).isUpdating} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* Left Sidebar - Mobile: Hidden by default, Desktop: Always visible */}
        <div className={`hidden lg:block w-80 overflow-y-auto border-r ${sidebarColors}`}>
          <div className="p-3 sm:p-4">
            {/* Course Title */}
            <div className={`mb-3 sm:mb-4 pb-2 sm:pb-3 border-b ${titleBorder}`}>
              <h2 className={`text-base sm:text-lg font-bold ${titleText}`}>{course.title}</h2>
              <p className={`text-xs sm:text-sm mt-1 ${smallText}`}>
                {course.modules?.length || 0} modules • {getTotalLessonsCount()} lessons
              </p>
            </div>

            {/* File Tree */}
            <div className="space-y-1">
              {canAccessContent && course.modules && course.modules.length > 0 ? (
                course.modules.map((module: any, moduleIndex) => (
                  <div key={module.id}>
                    {/* Module Row - Responsive */}
                    <div className={`flex items-center group rounded-md ${moduleRowHover}`}>
                      <button
                        onClick={() => setExpandedModules(prev => ({ ...prev, [module.id]: !prev[module.id] }))}
                        className="flex items-center flex-1 py-1 sm:py-1.5 px-1.5 sm:px-2 text-xs sm:text-sm"
                      >
                        <div className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex items-center justify-center">
                          {expandedModules[module.id] ? (
                            <ChevronDown className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${chevronColor}`} />
                          ) : (
                            <ChevronRight className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${chevronColor}`} />
                          )}
                        </div>
                        <div className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2">
                          {expandedModules[module.id] ? (
                            <FolderOpen className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                          ) : (
                            <Folder className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                          )}
                        </div>
                        <span className={`truncate font-medium ${moduleTitleText}`}>{module.title}</span>
                      </button>
                    </div>

                    {/* Lessons */}
                    {expandedModules[module.id] && module.lessons?.map((lesson: any, lessonIndex: number) => {
                      const isCurrentLesson = selectedLessonId === lesson.id;
                      const isCompleted = course.lessonProgress?.[lesson.id]?.completed || false;
                      
                      return (
                        <div
                          key={lesson.id}
                          className={`flex items-center group ml-4 sm:ml-6 rounded-md cursor-pointer relative ${
                            isCurrentLesson ? lessonCurrentBg : lessonInactiveHover
                          }`}
                          onClick={() => navigateToLesson(moduleIndex, lessonIndex, lesson.id)}
                        >
                          <div className="flex items-center flex-1 py-1 sm:py-1.5 px-1.5 sm:px-2 text-xs sm:text-sm">
                            <div className={`w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex items-center justify-center ${
                              isCompleted ? 'text-green-600' : iconIdle
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                              ) : (
                                <File className="w-3 h-3 sm:w-4 sm:h-4" />
                              )}
                            </div>
                            <span className={`${lessonTitle} truncate ${
                              isCompleted ? 'line-through opacity-75' : ''
                            } ${isCurrentLesson ? 'font-medium' : ''}`}>
                              {lesson.title}
                            </span>
                            <div className="flex items-center space-x-1 ml-1.5 sm:ml-2 flex-shrink-0">
                              {lesson.video_url && <Video className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" />}
                              {lesson.resource_files && lesson.resource_files.length > 0 && (
                                <span className={`text-xs px-1 py-0.5 rounded ${countBadge}`}>
                                  {lesson.resource_files.length}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  {!canAccessContent ? (
                    <>
                      <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 text-sm mb-4">This is a paid course. Subscribe to unlock the content.</p>
                      <button
                        onClick={() => handleSubscribeToCourse && handleSubscribeToCourse(courseId)}
                        disabled={isSubscribing}
                        className="inline-flex items-center px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                      >
                        {isSubscribing ? 'Redirecting…' : 'Subscribe'}
                      </button>
                    </>
                  ) : (
                    <>
                      <Folder className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 text-sm">No content available</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Mobile First Responsive */}
        <div className="flex-1 overflow-y-auto">
          {canAccessContent && currentLesson ? (
              <div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
              {/* Lesson Header - Mobile Responsive */}
              <div className="mb-4 sm:mb-6 lg:mb-8">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${chipBlue}`}>
                    Module {currentModuleIndex + 1}
                  </span>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${chipGreen}`}>
                    Lesson {currentLessonIndex + 1}
                  </span>
                </div>
                
                <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 ${h1Color}`}>{currentLesson.title}</h1>
                <div className={`flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm ${metaText}`}>
                  {currentLesson.video_url && (
                    <span>{getVideoSource(currentLesson.video_url)}</span>
                  )}
                  {course.lessonProgress?.[currentLesson.id]?.completed && (
                    <>
                      {currentLesson.video_url && <span>•</span>}
                      <span className={`font-medium flex items-center ${completedText}`}>
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Completed
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Video Player - Mobile Responsive */}
              {currentLesson.video_url && (
                <div className="bg-black rounded-lg sm:rounded-xl overflow-hidden mb-4 sm:mb-6 lg:mb-8 shadow-lg sm:shadow-xl">
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

              {/* Lesson Content - Mobile Responsive */}
              <div className={`rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 xl:p-8 mb-4 sm:mb-6 lg:mb-8 border ${contentPanel}`}>
                <h2 className={`text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 lg:mb-6 ${sectionTitle}`}>Lesson Overview</h2>
                
                {currentLesson.description && (
                  <div className="prose prose-lg max-w-none mb-6">
                    <p className={`leading-relaxed ${bodyText}`}>{currentLesson.description}</p>
                  </div>
                )}

                {currentLesson.additional_content && (
                  <div className={`rounded-lg p-6 mb-6 ${notesBg}`}>
                    <h3 className={`font-semibold mb-3 ${sectionTitle}`}>Additional Notes</h3>
                    <div className={`whitespace-pre-wrap ${bodyText}`}>
                      {currentLesson.additional_content}
                    </div>
                  </div>
                )}

                {/* Resource Files - Mobile Responsive */}
                {currentLesson.resource_files && currentLesson.resource_files.length > 0 && (
                  <div className="border-t border-gray-200 pt-4 sm:pt-6">
                    <h3 className={`font-semibold mb-3 sm:mb-4 text-sm sm:text-base ${sectionTitle}`}>Resource Files</h3>
                    <div className="grid gap-2 sm:gap-3">
                      {currentLesson.resource_files.map((file: any, index: number) => (
                        <div key={index} className={`rounded-lg p-3 sm:p-4 border ${resourceCard}`}>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className="text-lg sm:text-2xl">
                                {getFileIcon(file.originalName)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-medium text-sm sm:text-base ${sectionTitle} truncate`}>{file.originalName}</h4>
                                <p className={`text-xs sm:text-sm ${bodyText}`}>
                                  {file.size && `${(file.size / 1024 / 1024).toFixed(2)} MB`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-500 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                              >
                                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>Open</span>
                              </a>
                              <a
                                href={file.url}
                                download={file.originalName}
                                className="bg-green-500 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                              >
                                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
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

              {/* Navigation - Mobile Responsive */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                <button
                  onClick={prevLesson}
                  disabled={currentGlobalIndex === 0}
                  className={`flex items-center justify-center px-3 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base ${prevBtn}`}
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                  <span className="hidden sm:inline">Previous Lesson</span>
                  <span className="sm:hidden">Previous</span>
                </button>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                  {!course.lessonProgress?.[currentLesson.id]?.completed && (
                    <button
                      onClick={markAsComplete}
                      disabled={updatingProgress}
                      className="bg-green-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {updatingProgress ? (
                        <>
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                          <span className="hidden sm:inline">Mark as Complete</span>
                          <span className="sm:hidden">Complete</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={nextLesson}
                    disabled={currentGlobalIndex === allLessons.length - 1}
                    className="flex items-center justify-center px-3 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">Next Lesson</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                {!canAccessContent ? (
                  <>
                    <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Subscribe to access this course</h3>
                    <p className="text-gray-600 mb-4">One-time payment unlocks all lessons.</p>
                    <button
                      onClick={() => handleSubscribeToCourse && handleSubscribeToCourse(courseId)}
                      disabled={isSubscribing}
                      className="inline-flex items-center px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                    >
                      {isSubscribing ? 'Redirecting…' : `Subscribe${typeof course.price === 'number' ? ` - $${course.price}` : ''}`}
                    </button>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No lesson selected</h3>
                    <p className="text-gray-600">Select a lesson from the sidebar to start learning</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentLearningView;