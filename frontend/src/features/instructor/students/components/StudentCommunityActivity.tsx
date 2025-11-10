import React from 'react';
import { MessageSquare, Users } from 'lucide-react';
import { useTheme } from '../../../../contexts/ThemeContext';
import type { StudentDetails } from '../../../../services/instructorStudentService';
import Pagination from '../../../../components/shared/ui/Pagination';
import { RowsPerPageSelect } from '../../../../components/shared/ui/RowsPerPageSelect';
import { useNavigate } from 'react-router-dom';

export function StudentCommunityActivity({ student }: { student: StudentDetails }) {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'posts' | 'comments'>('posts');
  const [postsPage, setPostsPage] = React.useState(1);
  const [postsRpp, setPostsRpp] = React.useState(5);
  const [commentsPage, setCommentsPage] = React.useState(1);
  const [commentsRpp, setCommentsRpp] = React.useState(5);

  const postsPaged = React.useMemo(() => {
    const start = (postsPage - 1) * postsRpp;
    return {
      rows: student.posts.slice(start, start + postsRpp),
      totalPages: Math.max(1, Math.ceil(student.posts.length / postsRpp)),
    };
  }, [student.posts, postsPage, postsRpp]);

  const commentsPaged = React.useMemo(() => {
    const start = (commentsPage - 1) * commentsRpp;
    return {
      rows: student.comments.slice(start, start + commentsRpp),
      totalPages: Math.max(1, Math.ceil(student.comments.length / commentsRpp)),
    };
  }, [student.comments, commentsPage, commentsRpp]);
  return (
    <div>
      <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Community Activity</h2>
      <div>
        <div className="flex gap-6 mb-6">
          <button onClick={()=>setActiveTab('posts')} className={`pb-2 border-b-2 transition-colors font-medium ${activeTab==='posts' ? 'border-indigo-600 text-indigo-600' : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-200' : 'border-transparent text-gray-500 hover:text-gray-700')}`}>Recent Posts</button>
          <button onClick={()=>setActiveTab('comments')} className={`pb-2 border-b-2 transition-colors font-medium ${activeTab==='comments' ? 'border-indigo-600 text-indigo-600' : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-200' : 'border-transparent text-gray-500 hover:text-gray-700')}`}>Recent Comments</button>
        </div>

        {activeTab === 'posts' && (
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Recent Posts ({student.posts.length})</h3>
          {student.posts.length > 0 ? (
            <div className="space-y-4">
              {postsPaged.rows.map(post => (
                <div key={post.id} onClick={()=>navigate(`/coach/community?postId=${post.id}`)} className={`cursor-pointer rounded-lg p-4 border transition-colors ${isDarkMode ? 'border-gray-800 hover:bg-gray-800/60' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>{post.category}</span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-3 leading-relaxed`}>{post.content}</p>
                  <div className={`flex gap-6 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="flex items-center gap-1"><span>👍</span> {post.likeCount} likes</span>
                    <span className="flex items-center gap-1"><span>💬</span> {post.commentCount} comments</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <MessageSquare className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              No posts created yet
            </div>
          )}
          <div className="flex items-center justify-between mt-4 gap-4">
            <RowsPerPageSelect value={postsRpp} onChange={(n)=>{ setPostsRpp(n); setPostsPage(1); }} options={[5,10,15]} />
            <Pagination className="w-64 md:w-72" currentPage={postsPage} totalPages={postsPaged.totalPages} onPrevious={()=>setPostsPage(p=>Math.max(1,p-1))} onNext={()=>setPostsPage(p=>Math.min(postsPaged.totalPages,p+1))} />
          </div>
        </div>

        )}

        {activeTab === 'comments' && (
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Recent Comments ({student.comments.length})</h3>
          {student.comments.length > 0 ? (
            <div className="space-y-4">
              {commentsPaged.rows.map((comment: any) => (
                <div key={comment.id} onClick={()=>navigate(`/coach/community?postId=${comment.postId}`)} className={`cursor-pointer rounded-lg p-4 border transition-colors ${isDarkMode ? 'border-gray-800 hover:bg-gray-800/60' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <div className={`text-xs mb-2 p-2 rounded ${isDarkMode ? 'text-gray-400 bg-gray-800' : 'text-gray-500 bg-gray-100'}`}>Replied to: "{comment.postContent.slice(0,100)}{comment.postContent.length>100?'...':''}"</div>
                  <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-3 leading-relaxed`}>{comment.content}</p>
                  <div className={`flex justify-between text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="flex items-center gap-1"><span>👍</span> {comment.likeCount} likes</span>
                    <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              No comments made yet
            </div>
          )}
          <div className="flex items-center justify-between mt-4 gap-4">
            <RowsPerPageSelect value={commentsRpp} onChange={(n)=>{ setCommentsRpp(n); setCommentsPage(1); }} options={[5,10,15]} />
            <Pagination className="w-64 md:w-72" currentPage={commentsPage} totalPages={commentsPaged.totalPages} onPrevious={()=>setCommentsPage(p=>Math.max(1,p-1))} onNext={()=>setCommentsPage(p=>Math.min(commentsPaged.totalPages,p+1))} />
          </div>
        </div>
        )}
      </div>
    </div>
  );
}


