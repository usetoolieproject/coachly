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
    // Get instructor from user object (it's an array from Supabase join)
    const instructor = req.user?.instructors?.[0];
    const instructorId = instructor?.id;
    
    console.log('📋 Upload request - User:', req.user?.email, 'Role:', req.user?.role, 'Instructor ID:', instructorId);
    
    if (!instructorId) {
      return res.status(403).json({ error: 'Instructor access required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const videoBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const title = req.body.title || fileName.replace(/\.[^/.]+$/, ''); // Remove extension

    console.log(`📤 Uploading video: ${fileName} (${(videoBuffer.length / (1024 * 1024)).toFixed(2)} MB) for instructor: ${instructorId}`);

    // Upload to Bunny CDN
    const video = await bunnyService.uploadVideo(videoBuffer, fileName, instructorId, title);

    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      video
    });

  } catch (error) {
    console.error('❌ Upload error:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check if Bunny CDN is not configured
    if (error.message.includes('not configured') || error.message.includes('Missing environment variables')) {
      return res.status(503).json({ 
        error: 'Video upload service is not configured. Please contact support.',
        details: error.message,
        code: 'SERVICE_NOT_CONFIGURED'
      });
    }

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
    const instructor = req.user?.instructors?.[0];
    const instructorId = instructor?.id;

    if (!instructorId) {
      return res.status(403).json({ error: 'Instructor access required' });
    }

    console.log(`📹 Fetching videos for instructor: ${instructorId}`);

    const videos = await bunnyService.getInstructorVideos(instructorId);

    res.status(200).json({
      success: true,
      videos
    });

  } catch (error) {
    console.error('❌ Error fetching videos:', error.message);
    console.error('Error stack:', error.stack);
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
    const instructor = req.user?.instructors?.[0];
    const instructorId = instructor?.id;

    if (!instructorId) {
      return res.status(403).json({ error: 'Instructor access required' });
    }

    console.log(`📊 Fetching storage stats for instructor: ${instructorId}`);

    const stats = await bunnyService.getStorageStats(instructorId);

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ Error fetching storage stats:', error.message);
    console.error('Error stack:', error.stack);
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
    const instructor = req.user?.instructors?.[0];
    const instructorId = instructor?.id;
    const videoId = req.params.videoId;

    if (!instructorId) {
      return res.status(403).json({ error: 'Instructor access required' });
    }

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
    const instructor = req.user?.instructors?.[0];
    const instructorId = instructor?.id;
    const { videoIds } = req.body;

    if (!instructorId) {
      return res.status(403).json({ error: 'Instructor access required' });
    }

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
