import { useState, useEffect } from 'react';
import { Video, Search, Grid, List, Filter, Upload, Trash2, Play, Clock, FileVideo, Loader2, AlertCircle } from 'lucide-react';
import { videoLibraryService } from '../../../../services/videoLibraryService';
import { HlsVideoPlayer } from '../../../../components/shared/HlsVideoPlayer';
import { ProtectProFeature } from '../../../../components/ProtectProFeature';

interface VideoItem {
  id: string;
  bunny_video_id: string;
  title: string;
  thumbnail_url: string;
  video_url: string;
  duration: number;
  file_size: number;
  upload_date: string;
  views: number;
  status: 'processing' | 'ready' | 'failed';
}

interface StorageStats {
  totalVideos: number;
  usedStorageGB: string;
  maxStorageGB: number;
  storagePercentage: string;
  totalDurationSeconds: number;
}

const Library = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null);

  // Fetch videos and storage stats on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [videosData, statsData] = await Promise.all([
        videoLibraryService.getVideos(),
        videoLibraryService.getStorageStats()
      ]);
      console.log('📹 Fetched videos:', videosData);
      console.log('📊 Storage stats:', statsData);
      setVideos(videosData);
      setStorageStats(statsData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectVideo = (videoId: string) => {
    setSelectedVideos(prev =>
      prev.includes(videoId)
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedVideos.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedVideos.length} video(s)?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await videoLibraryService.bulkDeleteVideos(selectedVideos);
      setSelectedVideos([]);
      await fetchData(); // Refresh data
    } catch (err: any) {
      console.error('Error deleting videos:', err);
      alert('Failed to delete videos: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSingle = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await videoLibraryService.deleteVideo(videoId);
      await fetchData(); // Refresh data
    } catch (err: any) {
      console.error('Error deleting video:', err);
      alert('Failed to delete video: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your video library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-red-200 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Error Loading Videos</h3>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalVideos = storageStats?.totalVideos || 0;
  const usedStorage = parseFloat(storageStats?.usedStorageGB || '0');
  const maxStorage = storageStats?.maxStorageGB || 100;
  const storagePercentage = parseFloat(storageStats?.storagePercentage || '0');
  const totalDuration = videoLibraryService.formatTotalDuration(storageStats?.totalDurationSeconds || 0);

  return (
    <ProtectProFeature
      featureName="Video Library"
      featureKey="videoHosting"
      description="Store and manage unlimited videos with secure, fast hosting and seamless streaming."
    >
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Library</h1>
          <p className="text-gray-600">Manage your recorded videos and course content</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Videos */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Videos</p>
                <p className="text-3xl font-bold text-gray-900">{totalVideos}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileVideo className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Storage Used */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Storage Used</p>
                <p className="text-3xl font-bold text-gray-900">{usedStorage.toFixed(2)} GB</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  storagePercentage > 90 ? 'bg-red-600' : storagePercentage > 75 ? 'bg-orange-600' : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(storagePercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {usedStorage.toFixed(2)} GB of {maxStorage} GB used ({storagePercentage}%)
            </p>
          </div>

          {/* Total Duration */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Duration</p>
                <p className="text-3xl font-bold text-gray-900">{totalDuration}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {selectedVideos.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete ({selectedVideos.length})
                </button>
              )}
              
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Video
              </button>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'bg-white text-gray-600'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'bg-white text-gray-600'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Videos Grid/List */}
        {filteredVideos.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No videos found' : 'No videos yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Upload your first video to get started'}
            </p>
            {!searchQuery && (
              <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Video
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
                  >
                    {/* Thumbnail */}
                    <div 
                      className="relative group cursor-pointer"
                      onClick={() => video.status === 'ready' && setPlayingVideo(video)}
                    >
                      <img
                        src={video.thumbnail_url || 'https://via.placeholder.com/320x180?text=Processing'}
                        alt={video.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/320x180?text=No+Thumbnail';
                        }}
                      />
                      {video.status === 'processing' && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="text-center text-white">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                            <p className="text-sm">Processing...</p>
                          </div>
                        </div>
                      )}
                      {video.status === 'ready' && (
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                          <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-all duration-200" />
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        {videoLibraryService.formatDuration(video.duration)}
                      </div>
                      <div className="absolute top-2 left-2">
                        <input
                          type="checkbox"
                          checked={selectedVideos.includes(video.id)}
                          onChange={() => handleSelectVideo(video.id)}
                          className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {video.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{videoLibraryService.formatFileSize(video.file_size)}</span>
                        <span>{new Date(video.upload_date).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span>{video.views} views</span>
                        <button 
                          onClick={() => handleDeleteSingle(video.id)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Video</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Duration</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Size</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Upload Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Views</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVideos.map((video) => (
                      <tr key={video.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedVideos.includes(video.id)}
                            onChange={() => handleSelectVideo(video.id)}
                            className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div 
                            className="flex items-center gap-3 cursor-pointer hover:opacity-80"
                            onClick={() => video.status === 'ready' && setPlayingVideo(video)}
                          >
                            <div className="relative">
                              <img
                                src={video.thumbnail_url || 'https://via.placeholder.com/96x56?text=Processing'}
                                alt={video.title}
                                className="w-24 h-14 object-cover rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96x56?text=No+Thumbnail';
                                }}
                              />
                              {video.status === 'processing' && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                                </div>
                              )}
                              {video.status === 'ready' && (
                                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 flex items-center justify-center rounded transition-all">
                                  <Play className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-all" />
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">{video.title}</span>
                              {video.status === 'processing' && (
                                <p className="text-xs text-gray-500 mt-1">Processing...</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {videoLibraryService.formatDuration(video.duration)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {videoLibraryService.formatFileSize(video.file_size)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {new Date(video.upload_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{video.views}</td>
                        <td className="px-4 py-4 text-right">
                          <button 
                            onClick={() => handleDeleteSingle(video.id)}
                            disabled={isDeleting}
                            className="text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Video Player Modal */}
        {playingVideo && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setPlayingVideo(null)}
          >
            <div 
              className="relative w-full max-w-6xl bg-black rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setPlayingVideo(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full flex items-center justify-center text-white transition-all"
              >
                <span className="text-2xl">&times;</span>
              </button>

              {/* Video Player */}
              <div className="aspect-video bg-black">
                <HlsVideoPlayer
                  src={playingVideo.video_url}
                  autoPlay
                  controls
                  className="w-full h-full"
                />
              </div>

              {/* Video Info */}
              <div className="p-4 bg-gray-900 text-white">
                <h3 className="text-lg font-semibold mb-2">{playingVideo.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{videoLibraryService.formatFileSize(playingVideo.file_size)}</span>
                  <span>{videoLibraryService.formatDuration(playingVideo.duration)}</span>
                  <span>{new Date(playingVideo.upload_date).toLocaleDateString()}</span>
                  <span>{playingVideo.views} views</span>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </ProtectProFeature>
  );
};

export default Library;
