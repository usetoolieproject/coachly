import { getSupabaseClient } from '../repositories/supabaseClient.js';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';


const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(jpg|jpeg|png|gif|mp4|mov|avi|webm)$/i;
    const extname = allowedTypes.test(path.extname(file.originalname));
    const mimetype = /^(image|video)\//i.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

const uploadFileToStorage = async (file, folder = 'about-page-media') => {
  const supabase = getSupabaseClient();
  const fileExtension = path.extname(file.originalname);
  const fileName = `${folder}/${uuidv4()}${fileExtension}`;
  
  const { data, error } = await supabase.storage
    .from('instructor-media')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from('instructor-media')
    .getPublicUrl(fileName);

  return {
    url: urlData.publicUrl,
    fileName: fileName,
    originalName: file.originalname,
    size: file.size,
    mimeType: file.mimetype
  };
};

export const getAboutPage = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const instructorId = req.user.instructors[0].id;
    
    

    // First, get the about page
    const { data: aboutPage, error: aboutPageError } = await supabase
      .from('instructor_about_pages')
      .select(`
        *,
        instructors!inner(
          id,
          business_name,
          users!inner(first_name, last_name, profile_picture_url)
        )
      `)
      .eq('instructor_id', instructorId)
      .single();

    

    if (aboutPageError && aboutPageError.code !== 'PGRST116') {
      return res.status(400).json({ error: aboutPageError.message });
    }

    if (!aboutPage) {
      // Create default about page
      const defaultData = {
        instructor_id: instructorId,
        title: `${req.user.first_name || 'Your'} ${req.user.last_name || 'Name'}'s Learning Hub`, // Changed from Community to Hub
        // Remove subtitle field completely
        description: 'Welcome to my learning community! Join a thriving community of learners.',
        // Remove instructor_bio field completely
        primary_color: '#8b5cf6',
        secondary_color: '#3b82f6',
        // No subdomain column in instructor_about_pages; subdomain lives on instructors
        is_published: false,
        banner_url: null,
        custom_bullets: [
          "Comprehensive courses with lifetime access",
          "Active community with 24/7 peer support", 
          "Regular live Q&A sessions and coaching calls",
          "Exclusive resources and member-only content"
        ],
        is_paid_community: false,
        monthly_price: 0,
        included_features: ["courses", "community", "live_sessions"],
        testimonials: [
          {name: "Sarah M.", quote: "This community completely transformed my learning journey. The support and resources are incredible!"},
          {name: "Mike T.", quote: "Best investment I've made in my education. The courses are top-notch and the community is amazing."},
          {name: "Emma L.", quote: "I've learned more here in 3 months than I did in years of self-study. Highly recommend!"}
        ]
      };

      const { data: newAboutPage, error: createError } = await supabase
        .from('instructor_about_pages')
        .insert(defaultData)
        .select()
        .single();

      if (createError) {
        return res.status(400).json({ error: createError.message });
      }

      aboutPage = newAboutPage;
    }

    // Separately get intro content
    const { data: introContent, error: introError } = await supabase
      .from('instructor_intro_content')
      .select('*')
      .eq('about_page_id', aboutPage.id);

    

    // If intro content exists, get media items
    let mediaItems = [];
    if (introContent && introContent.length > 0) {
      const { data: media, error: mediaError } = await supabase
        .from('instructor_intro_media_items')
        .select('*')
        .eq('intro_content_id', introContent[0].id)
        .order('order_index');

      mediaItems = media || [];
    }

    // Manually construct the nested structure
    const formattedIntroContent = introContent && introContent.length > 0 ? [{
      ...introContent[0],
      instructor_intro_media_items: mediaItems
    }] : [];


    // Get course stats 
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title, is_published, thumbnail_url, description')
      .eq('instructor_id', instructorId);

    const publishedCourses = courses?.filter(c => c.is_published) || [];

    // Get student count from enrollments
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('student_id')
      .in('course_id', publishedCourses.map(c => c.id));

    const uniqueStudents = new Set(enrollments?.map(e => e.student_id) || []).size;

    const responseData = {
      ...aboutPage,
      instructor_intro_content: formattedIntroContent,
      stats: {
        totalCourses: publishedCourses.length,
        totalStudents: uniqueStudents,
        rating: 4.9
      },
      availableCourses: publishedCourses.map(course => ({
        id: course.id,
        title: course.title,
        thumbnail_url: course.thumbnail_url,
        description: course.description
      })),
      instructor: {
        id: instructorId,
        business_name: req.user.instructors[0].business_name,
        users: {
          first_name: req.user.first_name,
          last_name: req.user.last_name
        }
      }
    };

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAboutPage = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const updateData = { updated_at: new Date().toISOString() };
    
    const allowedFields = [
      'title', 'description', 'primary_color', 'secondary_color', 
      'custom_domain', 'is_published', 'banner_url', 'custom_bullets', 
      'is_paid_community', 'monthly_price', 'included_features', 'testimonials'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field.replace(/([A-Z])/g, '_$1').toLowerCase()] = req.body[field];
      }
    });

    // Try update first, but don't force single row to avoid PostgREST coercion error
    const { data: updatedRows, error: updateError } = await supabase
      .from('instructor_about_pages')
      .update(updateData)
      .eq('instructor_id', req.user.instructors[0].id)
      .select(`
        *,
        instructor_intro_content (
          *,
          instructor_intro_media_items (*)
        )
      `);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // If no row existed to update, create a default row (upsert behavior)
    let aboutPage = updatedRows && updatedRows.length > 0 ? updatedRows[0] : null;
    if (!aboutPage) {
      const instructorId = req.user.instructors[0].id;
      const defaultData = {
        instructor_id: instructorId,
        title: `${req.user.first_name || 'Your'} ${req.user.last_name || 'Name'}'s Learning Hub`,
        description: 'Welcome to my learning community! Join a thriving community of learners.',
        primary_color: '#8b5cf6',
        secondary_color: '#3b82f6',
        // No subdomain column here; it belongs to instructors
        is_published: false,
        banner_url: null,
        custom_bullets: [
          'Comprehensive courses with lifetime access',
          'Active community with 24/7 peer support',
          'Regular live Q&A sessions and coaching calls',
          'Exclusive resources and member-only content'
        ],
        is_paid_community: false,
        monthly_price: 0,
        included_features: ['courses', 'community', 'live_sessions'],
        testimonials: [
          { name: 'Sarah M.', quote: 'This community completely transformed my learning journey. The support and resources are incredible!' },
          { name: 'Mike T.', quote: 'Best investment I\'ve made in my education. The courses are top-notch and the community is amazing.' },
          { name: 'Emma L.', quote: 'I\'ve learned more here in 3 months than I did in years of self-study. Highly recommend!' }
        ]
      };

      // Merge any incoming fields (e.g., is_published true when publishing)
      const insertData = { ...defaultData, ...Object.fromEntries(Object.entries(updateData).filter(([k]) => k !== 'updated_at')) };

      const { data: inserted, error: insertError } = await supabase
        .from('instructor_about_pages')
        .insert(insertData)
        .select(`
          *,
          instructor_intro_content (
            *,
            instructor_intro_media_items (*)
          )
        `);

      if (insertError) {
        return res.status(400).json({ error: insertError.message });
      }
      aboutPage = inserted && inserted.length > 0 ? inserted[0] : null;
    }

    return res.json(aboutPage);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createIntroContent = [
  upload.array('mediaFiles', 10),
  async (req, res) => {
    try {
      const supabase = getSupabaseClient();
      const { description, videoUrls } = req.body;


      if (!description) {
        
        return res.status(400).json({ error: 'Description is required' });
      }

      // Check if user has instructor profile
      if (!req.user.instructors || req.user.instructors.length === 0) {
        
        return res.status(400).json({ error: 'No instructor profile found' });
      }

      const instructorId = req.user.instructors[0].id;
      

      // Get about page
      const { data: aboutPage, error: aboutPageError } = await supabase
        .from('instructor_about_pages')
        .select('id')
        .eq('instructor_id', instructorId)
        .single();

      

      if (aboutPageError || !aboutPage) {
        
        
        // Create about page if it doesn't exist
        const defaultData = {
          instructor_id: instructorId,
          title: `${req.user.first_name || 'Your'} ${req.user.last_name || 'Name'}'s Learning Hub`, // Changed from Community to Hub
          // Remove subtitle field completely
          description: 'Welcome to my learning community! Join a thriving community of learners.',
          // Remove instructor_bio field completely
          primary_color: '#8b5cf6',
          secondary_color: '#3b82f6',
          // no subdomain column here; value is on instructors
          is_published: false,
          banner_url: null,
          custom_bullets: [
            "Comprehensive courses with lifetime access",
            "Active community with 24/7 peer support", 
            "Regular live Q&A sessions and coaching calls",
            "Exclusive resources and member-only content"
          ],
          is_paid_community: false,
          monthly_price: 0,
          included_features: ["courses", "community", "live_sessions"],
          testimonials: [
            {name: "Sarah M.", quote: "This community completely transformed my learning journey. The support and resources are incredible!"},
            {name: "Mike T.", quote: "Best investment I've made in my education. The courses are top-notch and the community is amazing."},
            {name: "Emma L.", quote: "I've learned more here in 3 months than I did in years of self-study. Highly recommend!"}
          ]
        };

        const { data: newAboutPage, error: createError } = await supabase
          .from('instructor_about_pages')
          .insert(defaultData)
          .select('id')
          .single();

        if (createError) {
          
          return res.status(400).json({ error: 'Failed to create about page: ' + createError.message });
        }

        aboutPage = newAboutPage;
        
      }

      // Check if intro content already exists
      const { data: existingContent, error: existingError } = await supabase
        .from('instructor_intro_content')
        .select('id')
        .eq('about_page_id', aboutPage.id)
        .single();

      

      if (existingContent) {
        
        return res.status(400).json({ error: 'Intro content already exists. Use update instead.' });
      }

      // Create intro content
      const { data: introContent, error: contentError } = await supabase
        .from('instructor_intro_content')
        .insert({
          about_page_id: aboutPage.id,
          description
        })
        .select()
        .single();

      

      if (contentError) {
        return res.status(400).json({ error: 'Failed to create intro content: ' + contentError.message });
      }

      // Process video URLs
      const mediaItems = [];
      if (videoUrls) {
        const urls = Array.isArray(videoUrls) ? videoUrls : [videoUrls];
        
        
        for (let i = 0; i < urls.length; i++) {
          if (urls[i] && urls[i].trim()) {
            mediaItems.push({
              intro_content_id: introContent.id,
              type: 'video',
              url: urls[i].trim(),
              order_index: mediaItems.length
            });
          }
        }
      }

      // Process uploaded files
      if (req.files && req.files.length > 0) {
        
        
        for (const file of req.files) {
          try {
            const uploadResult = await uploadFileToStorage(file);
            mediaItems.push({
              intro_content_id: introContent.id,
              type: 'image',
              url: uploadResult.url,
              file_name: uploadResult.fileName,
              order_index: mediaItems.length
            });
          } catch (uploadError) {
            continue;
          }
        }
      }

      

      // Insert media items
      if (mediaItems.length > 0) {
        const { error: mediaError } = await supabase
          .from('instructor_intro_media_items')
          .insert(mediaItems);

        if (mediaError) {
          return res.status(400).json({ error: 'Failed to insert media items: ' + mediaError.message });
        }
      }

      // Return complete intro content with media items
      const { data: completeContent, error: fetchError } = await supabase
        .from('instructor_intro_content')
        .select(`
          *,
          instructor_intro_media_items (*)
        `)
        .eq('id', introContent.id)
        .single();

      if (fetchError) {
        return res.status(400).json({ error: 'Failed to fetch complete content: ' + fetchError.message });
      }

      
      res.status(201).json(completeContent);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
  }
];

export const updateIntroContent = [
  upload.array('mediaFiles', 10),
  async (req, res) => {
    try {
      const supabase = getSupabaseClient();
      const { contentId } = req.params;
      const { description, videoUrls, removeMediaIds } = req.body;

      // Update description if provided
      if (description) {
        const { error: updateError } = await supabase
          .from('instructor_intro_content')
          .update({ 
            description,
            updated_at: new Date().toISOString()
          })
          .eq('id', contentId);

        if (updateError) {
          return res.status(400).json({ error: updateError.message });
        }
      }

      // Remove specified media items
      if (removeMediaIds) {
        const idsToRemove = Array.isArray(removeMediaIds) ? removeMediaIds : [removeMediaIds];
        
        // Get file names to delete from storage
        const { data: mediaToDelete } = await supabase
          .from('instructor_intro_media_items')
          .select('file_name')
          .in('id', idsToRemove)
          .eq('intro_content_id', contentId);

        // Delete from storage
        if (mediaToDelete && mediaToDelete.length > 0) {
          const filesToDelete = mediaToDelete.filter(m => m.file_name).map(m => m.file_name);
          if (filesToDelete.length > 0) {
            await supabase.storage
              .from('instructor-media')
              .remove(filesToDelete);
          }
        }

        // Delete from database
        const { error: deleteError } = await supabase
          .from('instructor_intro_media_items')
          .delete()
          .in('id', idsToRemove)
          .eq('intro_content_id', contentId);

       
      }

      // Add new video URLs
      const newMediaItems = [];
      if (videoUrls) {
        const urls = Array.isArray(videoUrls) ? videoUrls : [videoUrls];
        
        // Get current max order_index
        const { data: existingMedia } = await supabase
          .from('instructor_intro_media_items')
          .select('order_index')
          .eq('intro_content_id', contentId)
          .order('order_index', { ascending: false })
          .limit(1);

        let nextOrderIndex = existingMedia && existingMedia.length > 0 ? existingMedia[0].order_index + 1 : 0;

        for (let i = 0; i < urls.length; i++) {
          if (urls[i] && urls[i].trim()) {
            newMediaItems.push({
              intro_content_id: contentId,
              type: 'video',
              url: urls[i].trim(),
              order_index: nextOrderIndex++
            });
          }
        }
      }

      // Add new uploaded files
      if (req.files && req.files.length > 0) {
        // Get current max order_index if we haven't already
        if (newMediaItems.length === 0) {
          const { data: existingMedia } = await supabase
            .from('instructor_intro_media_items')
            .select('order_index')
            .eq('intro_content_id', contentId)
            .order('order_index', { ascending: false })
            .limit(1);

          let nextOrderIndex = existingMedia && existingMedia.length > 0 ? existingMedia[0].order_index + 1 : 0;

          for (const file of req.files) {
            try {
              const uploadResult = await uploadFileToStorage(file);
              newMediaItems.push({
                intro_content_id: contentId,
                type: 'image',
                url: uploadResult.url,
                file_name: uploadResult.fileName,
                order_index: nextOrderIndex++
              });
            } catch (uploadError) {
              continue;
            }
          }
        } else {
          let nextOrderIndex = newMediaItems[newMediaItems.length - 1].order_index + 1;
          
          for (const file of req.files) {
            try {
              const uploadResult = await uploadFileToStorage(file);
              newMediaItems.push({
                intro_content_id: contentId,
                type: 'image',
                url: uploadResult.url,
                file_name: uploadResult.fileName,
                order_index: nextOrderIndex++
              });
            } catch (uploadError) {
              continue;
            }
          }
        }
      }

      // Insert new media items
      if (newMediaItems.length > 0) {
        const { error: mediaError } = await supabase
          .from('instructor_intro_media_items')
          .insert(newMediaItems);


      }

      // Return updated content
      const { data: updatedContent } = await supabase
        .from('instructor_intro_content')
        .select(`
          *,
          instructor_intro_media_items (*)
        `)
        .eq('id', contentId)
        .single();

      res.json(updatedContent);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

export const deleteIntroContent = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { contentId } = req.params;

    // Get media files to delete from storage
    const { data: mediaItems } = await supabase
      .from('instructor_intro_media_items')
      .select('file_name')
      .eq('intro_content_id', contentId);

    // Delete files from storage
    if (mediaItems && mediaItems.length > 0) {
      const filesToDelete = mediaItems.filter(m => m.file_name).map(m => m.file_name);
      if (filesToDelete.length > 0) {
        await supabase.storage
          .from('instructor-media')
          .remove(filesToDelete);
      }
    }

    // Delete intro content (media items will be deleted via cascade)
    const { error } = await supabase
      .from('instructor_intro_content')
      .delete()
      .eq('id', contentId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Intro content deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPublicAboutPage = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { subdomain } = req.params;

    

    // Use the same approach as getAboutPage - separate queries
    const { data: aboutPage, error } = await supabase
      .from('instructor_about_pages')
      .select(`
        *,
        instructors!inner(
          id,
          business_name,
          subdomain,
          users!inner(first_name, last_name, profile_picture_url)
        )
      `)
      .eq('instructors.subdomain', subdomain)
      .eq('is_published', true)
      .single();

    

    if (error) {
      
      return res.status(404).json({ error: 'About page not found' });
    }

    // Separately get intro content
    const { data: introContent, error: introError } = await supabase
      .from('instructor_intro_content')
      .select('*')
      .eq('about_page_id', aboutPage.id);

    

    // If intro content exists, get media items
    let mediaItems = [];
    if (introContent && introContent.length > 0) {
      const { data: media, error: mediaError } = await supabase
        .from('instructor_intro_media_items')
        .select('*')
        .eq('intro_content_id', introContent[0].id)
        .order('order_index');

      
      mediaItems = media || [];
    }

    // Manually construct the nested structure
    const formattedIntroContent = introContent && introContent.length > 0 ? [{
      ...introContent[0],
      instructor_intro_media_items: mediaItems
    }] : [];

    

    // Get course stats
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title, is_published, thumbnail_url, description')
      .eq('instructor_id', aboutPage.instructors.id);

    const publishedCourses = courses?.filter(c => c.is_published) || [];

    // Get student count from enrollments
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('student_id')
      .in('course_id', publishedCourses.map(c => c.id));

    const uniqueStudents = new Set(enrollments?.map(e => e.student_id) || []).size;

    const responseData = {
      ...aboutPage,
      instructor_intro_content: formattedIntroContent,
      stats: {
        totalCourses: publishedCourses.length,
        totalStudents: uniqueStudents,
        rating: 4.9
      },
      availableCourses: publishedCourses.map(course => ({
        id: course.id,
        title: course.title,
        thumbnail_url: course.thumbnail_url,
        description: course.description
      })),
      instructor: aboutPage.instructors
    };

    
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// New endpoint for joining community
// Replace the existing joinCommunity function with this:
// Replace the existing joinCommunity function in aboutPageController.js
export const joinCommunity = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { subdomain } = req.params;
    const { forceJoin } = req.body; // Optional parameter to force join even if already in a community
    const studentId = req.user.students[0].id;

    // Get instructor by subdomain
    const { data: aboutPage, error: aboutError } = await supabase
      .from('instructor_about_pages')
      .select(`
        instructors!inner(id, business_name, users!inner(first_name, last_name))
      `)
      .eq('subdomain', subdomain)
      .eq('is_published', true)
      .single();

    if (aboutError || !aboutPage) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const targetInstructorId = aboutPage.instructors.id;
    const targetInstructorName = `${aboutPage.instructors.users.first_name} ${aboutPage.instructors.users.last_name}`;

    // Get current student data including current instructor
    const { data: currentStudent, error: studentError } = await supabase
      .from('students')
      .select(`
        id,
        instructor_id,
        instructors(
          id,
          business_name,
          subdomain,
          users!inner(first_name, last_name)
        )
      `)
      .eq('id', studentId)
      .single();

    if (studentError) {
      return res.status(400).json({ error: 'Student not found' });
    }

    // Check if already in the same community
    if (currentStudent.instructor_id === targetInstructorId) {
      return res.status(200).json({ 
        status: 'already_joined',
        message: `You're already a member of ${targetInstructorName}'s community!`,
        community: {
          instructorName: targetInstructorName,
          businessName: aboutPage.instructors.business_name
        }
      });
    }

    // Check if already in a different community
    if (currentStudent.instructor_id && currentStudent.instructors && !forceJoin) {
      const currentInstructorName = `${currentStudent.instructors.users.first_name} ${currentStudent.instructors.users.last_name}`;
      return res.status(200).json({
        status: 'has_existing_community',
        message: 'You are already a member of another community',
        currentCommunity: {
          instructorName: currentInstructorName,
          businessName: currentStudent.instructors.business_name,
          subdomain: currentStudent.instructors.subdomain
        },
        targetCommunity: {
          instructorName: targetInstructorName,
          businessName: aboutPage.instructors.business_name,
          subdomain: subdomain
        }
      });
    }

    // Update student's instructor_id (join new community or replace existing)
    const { error: updateError } = await supabase
      .from('students')
      .update({ instructor_id: targetInstructorId })
      .eq('id', studentId);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    const successMessage = currentStudent.instructor_id 
      ? `Successfully switched to ${targetInstructorName}'s community!`
      : `Successfully joined ${targetInstructorName}'s community!`;

    res.json({ 
      status: 'success',
      message: successMessage,
      community: {
        instructorName: targetInstructorName,
        businessName: aboutPage.instructors.business_name
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add this new export for banner upload
export const uploadBanner = [
  upload.single('bannerFile'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No banner file provided' });
      }

      const uploadResult = await uploadFileToStorage(req.file, 'banners');
      
      // Update the about page with the new banner URL
      const supabase = getSupabaseClient();
      const { data: aboutPage, error } = await supabase
        .from('instructor_about_pages')
        .update({ 
          banner_url: uploadResult.url,
          updated_at: new Date().toISOString()
        })
        .eq('instructor_id', req.user.instructors[0].id)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ banner_url: uploadResult.url });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];