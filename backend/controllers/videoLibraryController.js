import bunnyService from '../services/bunnyService.js';

/**
 * Video Library Controller
 * Handles video upload, retrieval, and management for instructors
 */

/**
 * Upload video to Bunny CDN
 */
export const uploadVideo = async (req, res) => {
  try {
    const instructorId = req.user.instructor.id;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const videoBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const title = req.body.title || fileName.replace(/\.[^/.]+$/, ''); // Remove extension

    console.log(`📤 Uploading video: ${fileName} (${(videoBuffer.length / (1024 * 1024)).toFixed(2)} MB)`);

    // Upload to Bunny CDN
    const video = await bunnyService.uploadVideo(videoBuffer, fileName, instructorId, title);

    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      video
    });

  } catch (error) {
    console.error('❌ Upload error:', error.message);
    
    if (error.message.includes('Storage limit exceeded')) {
      return res.status(413).json({ 
        error: error.message,
        code: 'STORAGE_LIMIT_EXCEEDED'
      });
    }

    res.status(500).json({ 
      error: 'Failed to upload video',
      details: error.message 
    });
  }
};

/**
 * Get all videos for logged-in instructor
 */
export const getVideos = async (req, res) => {
  try {
    const instructorId = req.user.instructor.id;

    const videos = await bunnyService.getInstructorVideos(instructorId);

    res.status(200).json({
      success: true,
      videos
    });

  } catch (error) {
    console.error('❌ Error fetching videos:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch videos',
      details: error.message 
    });
  }
};

/**
 * Get storage statistics
 */
export const getStorageStats = async (req, res) => {
  try {
    const instructorId = req.user.instructor.id;

    const stats = await bunnyService.getStorageStats(instructorId);

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ Error fetching storage stats:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch storage stats',
      details: error.message 
    });
  }
};

/**
 * Delete a single video
 */
export const deleteVideo = async (req, res) => {
  try {
    const instructorId = req.user.instructor.id;
    const videoId = req.params.videoId;

    await bunnyService.deleteVideo(videoId, instructorId);

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting video:', error.message);
    res.status(500).json({ 
      error: 'Failed to delete video',
      details: error.message 
    });
  }
};

/**
 * Bulk delete videos
 */
export const bulkDeleteVideos = async (req, res) => {
  try {
    const instructorId = req.user.instructor.id;
    const { videoIds } = req.body;

    if (!Array.isArray(videoIds) || videoIds.length === 0) {
      return res.status(400).json({ error: 'No video IDs provided' });
    }

    const results = await bunnyService.bulkDeleteVideos(videoIds, instructorId);

    res.status(200).json({
      success: true,
      message: `Deleted ${results.success.length} videos`,
      results
    });

  } catch (error) {
    console.error('❌ Error bulk deleting videos:', error.message);
    res.status(500).json({ 
      error: 'Failed to delete videos',
      details: error.message 
    });
  }
};
