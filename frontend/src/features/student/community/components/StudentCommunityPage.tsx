import React, { useRef, useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { CommunityHeader, CategoriesBar, PostComposer, PostList, PostModal, ImageModal } from '../../../../components/shared/community';
import Pagination from '../../../../components/shared/ui/Pagination';
import { RefreshButton } from '../../../../components/shared/ui/RefreshButton';
import { UpdatingIndicator } from '../../../../components/shared/ui/UpdatingIndicator';
import { useStudentCommunity } from '../hooks/useStudentCommunity';
import { Users, MessageCircle } from 'lucide-react';

const categories = [
  { id: 'all', label: 'All Posts', className: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
  { id: 'general', label: '💬 General', className: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { id: 'questions', label: '❓ Questions', className: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
  { id: 'wins', label: '🏆 #Wins', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
  { id: 'introduction', label: '👋 Introduction', className: 'bg-green-100 text-green-700 hover:bg-green-200' },
  { id: 'announcements', label: '📢 Announcements', className: 'bg-red-100 text-red-700 hover:bg-red-200' },
];

const StudentCommunityPage: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [composerContent, setComposerContent] = useState('');
  const [composerCategory, setComposerCategory] = useState('general');
  const [composerImages, setComposerImages] = useState<string[]>([]);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState<any[]>([]);
  const [modalIndex, setModalIndex] = useState(0);
  const [submittingComment, setSubmittingComment] = useState(false);

  const {
    community,
    isLoadingCommunity,
    isFetchingCommunity,
    posts,
    isFetchingPosts,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    pageSize,
    selectedPost,
    postModalOpen,
    openModal,
    closeModal,
    likePost,
    addComment,
    likeComment,
    editComment,
    deleteComment,
    createPost,
    refetch,
  } = useStudentCommunity();

  const categoryLabel = (id: string) => categories.find(c => c.id === id)?.label;

  const onAddImages = (files: FileList) => {
    const urls: string[] = [];
    const fileArray = Array.from(files);
    fileArray.forEach(file => urls.push(URL.createObjectURL(file)));
    setComposerImages(prev => [...prev, ...urls]);
  };

  const openImageModal = (images: any[], index: number) => {
    setModalImages(images);
    setModalIndex(index);
    setImageModalOpen(true);
  };

  // Apply theme-aware category styles for readability in dark mode
  const themedCategories = isDarkMode
    ? [
        { id: 'all', label: 'All Posts', className: 'bg-gray-800 text-gray-200 hover:bg-gray-700' },
        { id: 'general', label: '💬 General', className: 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/40' },
        { id: 'questions', label: '❓ Questions', className: 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/40' },
        { id: 'wins', label: '🏆 #Wins', className: 'bg-yellow-900/30 text-yellow-300 hover:bg-yellow-900/40' },
        { id: 'introduction', label: '👋 Introduction', className: 'bg-green-900/30 text-green-300 hover:bg-green-900/40' },
        { id: 'announcements', label: '📢 Announcements', className: 'bg-red-900/30 text-red-300 hover:bg-red-900/40' },
      ]
    : categories;

  // Filter posts based on search query
  const filteredPosts = posts.filter(post =>
    searchQuery === '' || 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.users.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.users.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
  const pagedPosts = filteredPosts.slice((page - 1) * pageSize, page * pageSize);

  // Show no community state
  if (!isLoadingCommunity && !isFetchingCommunity && !community) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="text-center py-8 sm:py-12">
          <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No community joined</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">Join an instructor's community to access courses and connect with other students.</p>
          <button
            onClick={() => alert("Visit an instructor's about page to join their community")}
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-blue-700 text-sm sm:text-base"
          >
            Find Communities
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (!community) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 sm:space-x-4 animate-pulse">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-xl" />
            <div>
              <div className="h-5 sm:h-6 w-32 sm:w-48 bg-gray-200 rounded mb-2" />
              <div className="h-3 sm:h-4 w-48 sm:w-64 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="mt-4 lg:mt-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <UpdatingIndicator isUpdating={true} />
              <div className="text-center">
                <div className="h-5 sm:h-6 w-8 sm:w-10 bg-gray-200 rounded mx-auto mb-1" />
                <div className="h-3 sm:h-4 w-12 sm:w-16 bg-gray-200 rounded mx-auto" />
              </div>
              <div className="text-center">
                <div className="h-5 sm:h-6 w-8 sm:w-10 bg-gray-200 rounded mx-auto mb-1" />
                <div className="h-3 sm:h-4 w-12 sm:w-16 bg-gray-200 rounded mx-auto" />
              </div>
            </div>
          </div>
        </div>
        <div className="mb-4 sm:mb-6">
          <div className="space-y-4 sm:space-y-6">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 animate-pulse">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full mr-2 sm:mr-3" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{community.name}</h1>
              <p className="text-sm sm:text-base text-gray-600 truncate">Community • {community.instructor.firstName} {community.instructor.lastName}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 lg:mt-0 flex-shrink-0">
          {/* Larger screens: Updating indicator → Refresh → Courses → Members */}
          <div className="hidden lg:flex items-center justify-end space-x-4">
            <UpdatingIndicator isUpdating={isFetchingCommunity || isFetchingPosts} />
            <RefreshButton 
              onClick={refetch} 
              isRefreshing={isFetchingCommunity || isFetchingPosts}
            />
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{community.stats.totalCourses}</div>
              <div className="text-xs text-gray-600">Courses</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{community.stats.totalStudents}</div>
              <div className="text-xs text-gray-600">Members</div>
            </div>
          </div>
          
          {/* Smaller screens: Single row layout */}
          <div className="flex lg:hidden items-center w-full -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8">
            {/* Left side: Courses, Members */}
            <div className="flex items-center space-x-4 sm:space-x-6 px-3 sm:px-4 md:px-6 lg:px-8">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-gray-900">{community.stats.totalCourses}</div>
                <div className="text-xs sm:text-sm text-gray-600">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-gray-900">{community.stats.totalStudents}</div>
                <div className="text-xs sm:text-sm text-gray-600">Members</div>
              </div>
            </div>
            
            {/* Right side: Updating indicator, Refresh button - ABSOLUTE RIGHT EDGE */}
            <div className="flex items-center space-x-2 ml-auto px-3 sm:px-4 md:px-6 lg:px-8">
              <UpdatingIndicator isUpdating={isFetchingCommunity || isFetchingPosts} />
              <RefreshButton 
                onClick={refetch} 
                isRefreshing={isFetchingCommunity || isFetchingPosts}
              />
            </div>
          </div>
        </div>
      </div>

      <CommunityHeader 
        title="Community Discussions" 
        search={searchQuery} 
        onSearchChange={setSearchQuery}
      />

      <PostComposer
        content={composerContent}
        onChangeContent={setComposerContent}
        category={composerCategory}
        onChangeCategory={setComposerCategory}
        categories={categories.filter(c => c.id !== 'all')}
        images={composerImages}
        onAddImages={onAddImages}
        onRemoveImage={(i) => setComposerImages(prev => prev.filter((_, idx) => idx !== i))}
        onSubmit={async () => {
          if (!composerContent.trim()) return;
          try {
            setSubmitting(true);
            const success = await createPost(composerContent, composerCategory, composerImages);
            if (success) {
              setComposerContent('');
              setComposerCategory('general');
              setComposerImages([]);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }
          } finally {
            setSubmitting(false);
          }
        }}
        uploading={submitting}
        canSubmit={composerContent.trim().length > 0 && !submitting}
        fileInputRef={fileInputRef}
      />

      <CategoriesBar categories={themedCategories} active={activeCategory} onChange={setActiveCategory} />

      {isLoadingCommunity ? (
        <div className="space-y-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full mr-3" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <PostList
            posts={pagedPosts}
            onOpenModal={(p) => openModal(p)}
            onLike={(id) => likePost(id)}
            canPin={false}
            categoryLabel={categoryLabel}
          />

          {filteredPosts.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
              <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-sm sm:text-base text-gray-600">Start the conversation by creating your first post!</p>
            </div>
          )}

          <div className="mt-6 sm:mt-8">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPrevious={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          </div>
        </>
      )}

      {selectedPost && (
        <PostModal
          post={selectedPost}
          isOpen={postModalOpen}
          onClose={closeModal}
          onLike={() => likePost(selectedPost.id)}
          submittingComment={submittingComment}
          onComment={async (content) => {
            if (!content.trim()) return;
            setSubmittingComment(true);
            try {
              await addComment(selectedPost.id, content);
            } finally {
              setSubmittingComment(false);
            }
          }}
          onLikeComment={(commentId) => likeComment(commentId, selectedPost.id)}
          onEditComment={(commentId, content) => editComment(commentId, content, selectedPost.id)}
          onDeleteComment={(commentId) => deleteComment(commentId, selectedPost.id)}
          onImageClick={openImageModal}
          user={user}
        />
      )}

      <ImageModal 
        images={modalImages} 
        currentIndex={modalIndex} 
        isOpen={imageModalOpen} 
        onClose={() => setImageModalOpen(false)} 
        onNext={() => setModalIndex((i) => Math.min(i + 1, modalImages.length - 1))} 
        onPrev={() => setModalIndex((i) => Math.max(i - 1, 0))} 
      />
    </div>
  );
};

export default StudentCommunityPage;
