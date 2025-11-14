import axios from 'axios';
import FormData from 'form-data';
import { supabase } from '../repositories/supabaseClient.js';

/**
 * Bunny CDN Service
 * Handles video upload, storage, and management with Bunny.net Stream
 */

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;
const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE;
const BUNNY_STORAGE_PASSWORD = process.env.BUNNY_STORAGE_PASSWORD;
const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME;

// Storage limit per instructor (100GB in bytes)
const STORAGE_LIMIT_BYTES = 100 * 1024 * 1024 * 1024; // 100 GB

class BunnyService {
  /**
   * Upload video to Bunny Stream
   * @param {Buffer} videoBuffer - Video file buffer
   * @param {string} fileName - Original filename
   * @param {string} instructorId - Instructor ID
   * @param {string} title - Video title
   * @returns {Promise<Object>} Video metadata
   */
  async uploadVideo(videoBuffer, fileName, instructorId, title) {
    try {
      // Check storage limit before upload
      const currentStorage = await this.getInstructorStorageUsage(instructorId);
      const videoSize = videoBuffer.length;

      if (currentStorage + videoSize > STORAGE_LIMIT_BYTES) {
        const remainingGB = ((STORAGE_LIMIT_BYTES - currentStorage) / (1024 * 1024 * 1024)).toFixed(2);
        throw new Error(`Storage limit exceeded. You have ${remainingGB} GB remaining.`);
      }

      // Create video in Bunny Stream library
      const createResponse = await axios.post(
        `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`,
        {
          title: title || fileName,
        },
        {
          headers: {
            'AccessKey': BUNNY_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      const videoId = createResponse.data.guid;
      console.log('✅ Created video in Bunny Stream:', videoId);

      // Upload video file
      const uploadResponse = await axios.put(
        `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
        videoBuffer,
        {
          headers: {
            'AccessKey': BUNNY_API_KEY,
            'Content-Type': 'application/octet-stream'
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      console.log('✅ Uploaded video to Bunny Stream');

      // Get video details
      const videoDetails = await this.getVideoDetails(videoId);

      // Store video metadata in database
      const { data: dbVideo, error: dbError } = await supabase
        .from('instructor_videos')
        .insert({
          instructor_id: instructorId,
          bunny_video_id: videoId,
          title: title || fileName,
          file_name: fileName,
          file_size: videoSize,
          duration: videoDetails.length || 0,
          thumbnail_url: videoDetails.thumbnailUrl,
          video_url: `https://${BUNNY_CDN_HOSTNAME}/${videoId}/playlist.m3u8`,
          status: 'processing',
          upload_date: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) {
        console.error('❌ Database error:', dbError);
        throw new Error('Failed to save video metadata');
      }

      return {
        id: dbVideo.id,
        bunnyVideoId: videoId,
        title: dbVideo.title,
        fileName: fileName,
        fileSize: videoSize,
        duration: videoDetails.length,
        thumbnailUrl: videoDetails.thumbnailUrl,
        videoUrl: dbVideo.video_url,
        status: 'processing',
        uploadDate: dbVideo.upload_date
      };

    } catch (error) {
      console.error('❌ Bunny upload error:', error.response?.data || error.message);
      throw new Error(error.message || 'Failed to upload video to Bunny CDN');
    }
  }

  /**
   * Get video details from Bunny
   * @param {string} videoId - Bunny video GUID
   * @returns {Promise<Object>} Video details
   */
  async getVideoDetails(videoId) {
    try {
      const response = await axios.get(
        `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
        {
          headers: {
            'AccessKey': BUNNY_API_KEY
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('❌ Error getting video details:', error.message);
      throw error;
    }
  }

  /**
   * Get all videos for an instructor
   * @param {string} instructorId - Instructor ID
   * @returns {Promise<Array>} List of videos
   */
  async getInstructorVideos(instructorId) {
    try {
      const { data: videos, error } = await supabase
        .from('instructor_videos')
        .select('*')
        .eq('instructor_id', instructorId)
        .order('upload_date', { ascending: false });

      if (error) throw error;

      // Update video status from Bunny if processing
      const updatedVideos = await Promise.all(
        videos.map(async (video) => {
          if (video.status === 'processing') {
            try {
              const bunnyDetails = await this.getVideoDetails(video.bunny_video_id);
              
              // Update status if encoding is complete
              if (bunnyDetails.status === 4) { // 4 = Finished
                await supabase
                  .from('instructor_videos')
                  .update({ 
                    status: 'ready',
                    duration: bunnyDetails.length,
                    thumbnail_url: bunnyDetails.thumbnailUrl
                  })
                  .eq('id', video.id);
                
                return { ...video, status: 'ready', duration: bunnyDetails.length };
              }
            } catch (err) {
              console.error('Error updating video status:', err);
            }
          }
          return video;
        })
      );

      return updatedVideos;
    } catch (error) {
      console.error('❌ Error fetching instructor videos:', error.message);
      throw error;
    }
  }

  /**
   * Delete video from Bunny and database
   * @param {string} videoId - Database video ID
   * @param {string} instructorId - Instructor ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteVideo(videoId, instructorId) {
    try {
      // Get video details from database
      const { data: video, error: fetchError } = await supabase
        .from('instructor_videos')
        .select('*')
        .eq('id', videoId)
        .eq('instructor_id', instructorId)
        .single();

      if (fetchError || !video) {
        throw new Error('Video not found');
      }

      // Delete from Bunny Stream
      try {
        await axios.delete(
          `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${video.bunny_video_id}`,
          {
            headers: {
              'AccessKey': BUNNY_API_KEY
            }
          }
        );
        console.log('✅ Deleted video from Bunny Stream');
      } catch (bunnyError) {
        console.error('⚠️ Error deleting from Bunny (might not exist):', bunnyError.message);
        // Continue with database deletion even if Bunny delete fails
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('instructor_videos')
        .delete()
        .eq('id', videoId)
        .eq('instructor_id', instructorId);

      if (deleteError) throw deleteError;

      console.log('✅ Deleted video from database');
      return true;

    } catch (error) {
      console.error('❌ Error deleting video:', error.message);
      throw error;
    }
  }

  /**
   * Get total storage usage for an instructor
   * @param {string} instructorId - Instructor ID
   * @returns {Promise<number>} Storage used in bytes
   */
  async getInstructorStorageUsage(instructorId) {
    try {
      const { data: videos, error } = await supabase
        .from('instructor_videos')
        .select('file_size')
        .eq('instructor_id', instructorId);

      if (error) throw error;

      const totalBytes = videos.reduce((sum, video) => sum + (video.file_size || 0), 0);
      return totalBytes;

    } catch (error) {
      console.error('❌ Error calculating storage usage:', error.message);
      return 0;
    }
  }

  /**
   * Get storage statistics for an instructor
   * @param {string} instructorId - Instructor ID
   * @returns {Promise<Object>} Storage stats
   */
  async getStorageStats(instructorId) {
    try {
      const { data: videos, error } = await supabase
        .from('instructor_videos')
        .select('file_size, duration')
        .eq('instructor_id', instructorId);

      if (error) throw error;

      const totalBytes = videos.reduce((sum, video) => sum + (video.file_size || 0), 0);
      const totalDuration = videos.reduce((sum, video) => sum + (video.duration || 0), 0);
      const totalVideos = videos.length;

      return {
        totalVideos,
        usedStorageBytes: totalBytes,
        usedStorageGB: (totalBytes / (1024 * 1024 * 1024)).toFixed(2),
        maxStorageGB: 100,
        storagePercentage: ((totalBytes / STORAGE_LIMIT_BYTES) * 100).toFixed(1),
        totalDurationSeconds: totalDuration,
        remainingStorageBytes: STORAGE_LIMIT_BYTES - totalBytes,
        remainingStorageGB: ((STORAGE_LIMIT_BYTES - totalBytes) / (1024 * 1024 * 1024)).toFixed(2)
      };

    } catch (error) {
      console.error('❌ Error getting storage stats:', error.message);
      throw error;
    }
  }

  /**
   * Bulk delete videos
   * @param {Array<string>} videoIds - Array of video IDs to delete
   * @param {string} instructorId - Instructor ID
   * @returns {Promise<Object>} Deletion results
   */
  async bulkDeleteVideos(videoIds, instructorId) {
    const results = {
      success: [],
      failed: []
    };

    for (const videoId of videoIds) {
      try {
        await this.deleteVideo(videoId, instructorId);
        results.success.push(videoId);
      } catch (error) {
        results.failed.push({ videoId, error: error.message });
      }
    }

    return results;
  }
}

export default new BunnyService();
