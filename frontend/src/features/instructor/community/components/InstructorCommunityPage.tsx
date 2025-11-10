import React, { useRef, useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { CommunityHeader, CategoriesBar, PostComposer, PostList, PostModal, ImageModal } from '../../../../components/shared/community';
import Pagination from '../../../../components/shared/ui/Pagination';
import { RefreshButton } from '../../../../components/shared/ui/RefreshButton';
import { UpdatingIndicator } from '../../../../components/shared/ui/UpdatingIndicator';
import { useInstructorCommunity } from '../hooks/useInstructorCommunity';

const categories = [
  { id: 'all', label: 'All Posts', className: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
  { id: 'general', label: '💬 General', className: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { id: 'questions', label: '❓ Questions', className: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
  { id: 'wins', label: '🏆 #Wins', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
  { id: 'introduction', label: '👋 Introduction', className: 'bg-green-100 text-green-700 hover:bg-green-200' },
  { id: 'announcements', label: '📢 Announcements', className: 'bg-red-100 text-red-700 hover:bg-red-200' },
];

const InstructorCommunityPage: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [composerContent, setComposerContent] = useState('');
  const [composerCategory, setComposerCategory] = useState('general');
  const [composerImages, setComposerImages] = useState<string[]>([]);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState<any[]>([]);
  const [modalIndex, setModalIndex] = useState(0);
  const [submittingComment, setSubmittingComment] = useState(false);

  const {
    activeCategory, setActiveCategory,
    search, setSearch,
    posts, isLoading, isFetching, refetch,
    selectedPost, setSelectedPost,
    postModalOpen, setPostModalOpen,
    likePost, togglePin, createPost,
    addComment, likeComment, editComment, deleteComment,
  } = useInstructorCommunity();

  const categoryLabel = (id: string) => categories.find(c => c.id === id)?.label;

  const onAddImages = (files: FileList) => {
    const urls: string[] = [];
    const fileArray = Array.from(files);
    fileArray.forEach(file => urls.push(URL.createObjectURL(file)));
    setComposerImages(prev => [...prev, ...urls]);
    setPendingFiles(prev => [...prev, ...fileArray]);
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

  // client-side pagination (page size 10) always shows a footer pager
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil((posts?.length || 0) / pageSize));
  const pagedPosts = posts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CommunityHeader 
        title="Community" 
        search={search} 
        onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
        actionsSlot={
          <>
            <UpdatingIndicator isUpdating={isFetching} />
            <RefreshButton onClick={() => refetch()} isRefreshing={isFetching} />
          </>
        }
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
            await createPost(composerContent, composerCategory, pendingFiles);
            setComposerContent('');
            setComposerCategory('general');
            setComposerImages([]);
            setPendingFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
          } finally {
            setSubmitting(false);
          }
        }}
        uploading={submitting}
        canSubmit={composerContent.trim().length > 0 && !submitting}
        fileInputRef={fileInputRef}
      />
      <CategoriesBar categories={themedCategories} active={activeCategory} onChange={setActiveCategory} />
      {isLoading ? (
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
        <PostList
          posts={pagedPosts}
          onOpenModal={(p) => { setSelectedPost(p); setPostModalOpen(true); }}
          onLike={(id) => likePost(id)}
          canPin={true}
          onTogglePin={(id) => togglePin(id)}
          categoryLabel={categoryLabel}
        />
      )}

      <div className="mt-8">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
          onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        />
      </div>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          isOpen={postModalOpen}
          onClose={() => setPostModalOpen(false)}
          onLike={() => likePost(selectedPost.id)}
          submittingComment={submittingComment}
          onComment={async (content) => {
            if (!content.trim()) return;
            // Optimistic UI: append a temp comment
            const tempId = `temp-${Date.now()}`;
            const optimistic = {
              id: tempId,
              content,
              created_at: new Date().toISOString(),
              like_count: 0,
              user_has_liked: false,
              users: {
                id: user?.id,
                first_name: user?.firstName || 'You',
                last_name: user?.lastName || '',
                profile_picture_url: user?.profilePictureUrl || '',
                role: 'instructor',
              }
            } as any;
            setSelectedPost({ ...selectedPost, comments: [...selectedPost.comments, optimistic] } as any);
            setSubmittingComment(true);
            try {
              await addComment(selectedPost.id, content);
            } finally {
              setSubmittingComment(false);
            }
          }}
          onLikeComment={(commentId) => likeComment(commentId)}
          onEditComment={(commentId, content) => editComment(commentId, content)}
          onDeleteComment={(commentId) => deleteComment(commentId)}
          onImageClick={openImageModal}
          user={user}
        />
      )}

      <ImageModal images={modalImages} currentIndex={modalIndex} isOpen={imageModalOpen} onClose={() => setImageModalOpen(false)} onNext={() => setModalIndex((i) => Math.min(i + 1, modalImages.length - 1))} onPrev={() => setModalIndex((i) => Math.max(i - 1, 0))} />
    </div>
  );
};

export default InstructorCommunityPage;


