import { useState } from 'react';
import { Video, Search, Grid, List, Filter, Upload, Trash2, Play, Clock, FileVideo } from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  size: string;
  uploadDate: string;
  views: number;
}

const Library = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);

  // Mock data - will be replaced with actual data from Bunny CDN
  const videos: VideoItem[] = [
    {
      id: '1',
      title: 'Introduction to Course Module 1',
      thumbnail: 'https://via.placeholder.com/320x180',
      duration: '15:30',
      size: '245 MB',
      uploadDate: '2025-11-10',
      views: 45
    },
    {
      id: '2',
      title: 'Advanced Techniques Session',
      thumbnail: 'https://via.placeholder.com/320x180',
      duration: '28:45',
      size: '520 MB',
      uploadDate: '2025-11-08',
      views: 78
    },
    {
      id: '3',
      title: 'Q&A Session Recording',
      thumbnail: 'https://via.placeholder.com/320x180',
      duration: '42:15',
      size: '850 MB',
      uploadDate: '2025-11-05',
      views: 124
    },
  ];

  // Storage stats - will be calculated from actual data
  const totalVideos = videos.length;
  const usedStorage = 1.6; // GB
  const maxStorage = 100; // GB
  const storagePercentage = (usedStorage / maxStorage) * 100;

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

  const handleDeleteSelected = () => {
    if (selectedVideos.length === 0) return;
    // Will implement delete functionality
    console.log('Delete videos:', selectedVideos);
  };

  return (
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
                <p className="text-3xl font-bold text-gray-900">{usedStorage} GB</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${storagePercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {usedStorage} GB of {maxStorage} GB used ({storagePercentage.toFixed(1)}%)
            </p>
          </div>

          {/* Total Duration */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Duration</p>
                <p className="text-3xl font-bold text-gray-900">1h 26m</p>
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
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
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
                    <div className="relative group cursor-pointer">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-all duration-200" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
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
                        <span>{video.size}</span>
                        <span>{new Date(video.uploadDate).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span>{video.views} views</span>
                        <button className="text-red-600 hover:text-red-700">
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
                          <div className="flex items-center gap-3">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-24 h-14 object-cover rounded"
                            />
                            <span className="font-medium text-gray-900">{video.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{video.duration}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{video.size}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {new Date(video.uploadDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{video.views}</td>
                        <td className="px-4 py-4 text-right">
                          <button className="text-red-600 hover:text-red-700">
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
      </div>
    </div>
  );
};

export default Library;
