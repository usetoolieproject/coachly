import api from './api';

interface Video {
  id: string;
  bunny_video_id: string;
  title: string;
  file_name: string;
  file_size: number;
  duration: number;
  thumbnail_url: string;
  video_url: string;
  status: 'processing' | 'ready' | 'failed';
  upload_date: string;
  views: number;
}

interface StorageStats {
  totalVideos: number;
  usedStorageBytes: number;
  usedStorageGB: string;
  maxStorageGB: number;
  storagePercentage: string;
  totalDurationSeconds: number;
  remainingStorageBytes: number;
  remainingStorageGB: string;
}

export const videoLibraryService = {
  /**
   * Upload a video to Bunny CDN
   */
  async uploadVideo(videoFile: File, title?: string): Promise<Video> {
    const formData = new FormData();
    formData.append('video', videoFile);
    if (title) {
      formData.append('title', title);
    }

    const response = await api.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload Progress: ${percentCompleted}%`);
        }
      },
    });

    return response.data.video;
  },

  /**
   * Get all videos for the current instructor
   */
  async getVideos(): Promise<Video[]> {
    const response = await api.get('/videos');
    return response.data.videos;
  },

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<StorageStats> {
    const response = await api.get('/videos/storage-stats');
    return response.data.stats;
  },

  /**
   * Delete a single video
   */
  async deleteVideo(videoId: string): Promise<void> {
    await api.delete(`/videos/${videoId}`);
  },

  /**
   * Delete multiple videos
   */
  async bulkDeleteVideos(videoIds: string[]): Promise<{ success: string[]; failed: any[] }> {
    const response = await api.post('/videos/bulk-delete', { videoIds });
    return response.data.results;
  },

  /**
   * Format bytes to human-readable size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  },

  /**
   * Format seconds to duration string (HH:MM:SS or MM:SS)
   */
  formatDuration(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * Format total duration to readable string (e.g., "1h 26m")
   */
  formatTotalDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  },
};
