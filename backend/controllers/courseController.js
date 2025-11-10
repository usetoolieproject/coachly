import { getSupabaseClient } from '../repositories/supabaseClient.js';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';


// Configure multer for file uploads - UPDATE the fileFilter
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types
    cb(null, true);
  }
});

// Upload file to Supabase Storage
const uploadFileToStorage = async (file, folder = 'lesson-resources') => {
  const supabase = getSupabaseClient();
  const fileExtension = path.extname(file.originalname);
  const fileName = `${folder}/${uuidv4()}${fileExtension}`;
  
  const { data, error } = await supabase.storage
    .from('course-files')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) {
    throw new Error(`File upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('course-files')
    .getPublicUrl(fileName);

  return {
    url: urlData.publicUrl,
    fileName: fileName,
    originalName: file.originalname,
    size: file.size,
    mimeType: file.mimetype
  };
};

// Get instructor's courses (ordered by order_index)
export const getCourses = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        *,
        modules (
          id,
          title,
          lessons (id)
        )
      `)
      .eq('instructor_id', req.user.instructors[0].id)
      .order('order_index', { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new course
export const createCourse = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { title, description, category, level, type, price, thumbnailUrl, publishImmediately } = req.body;

    if (!title || !category || !level || !type) {
      return res.status(400).json({ error: 'Title, category, level, and type are required' });
    }

    // Get the next order index
    const { count } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('instructor_id', req.user.instructors[0].id);

    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        instructor_id: req.user.instructors[0].id,
        title,
        description,
        category,
        level,
        type,
        price: type === 'paid' ? price : 0,
        thumbnail_url: thumbnailUrl,
        is_published: publishImmediately || false,
        order_index: count || 0
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update course order
export const updateCourseOrder = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { courseId } = req.params;
    const { direction } = req.body; // 'left' or 'right'

    // Get current course
    const { data: currentCourse, error: currentError } = await supabase
      .from('courses')
      .select('order_index')
      .eq('id', courseId)
      .eq('instructor_id', req.user.instructors[0].id)
      .single();

    if (currentError || !currentCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const currentIndex = currentCourse.order_index;
    const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;

    // Get all courses for this instructor
    const { data: allCourses, error: allError } = await supabase
      .from('courses')
      .select('id, order_index')
      .eq('instructor_id', req.user.instructors[0].id)
      .order('order_index');

    if (allError) {
      return res.status(400).json({ error: allError.message });
    }

    // Find the course to swap with
    const courseToSwap = allCourses.find(course => course.order_index === newIndex);
    
    if (!courseToSwap) {
      return res.status(400).json({ error: 'Cannot move course in that direction' });
    }

    // Swap the order indexes
    const { error: updateError1 } = await supabase
      .from('courses')
      .update({ order_index: newIndex })
      .eq('id', courseId);

    const { error: updateError2 } = await supabase
      .from('courses')
      .update({ order_index: currentIndex })
      .eq('id', courseToSwap.id);

    if (updateError1 || updateError2) {
      return res.status(400).json({ error: 'Failed to update course order' });
    }

    res.json({ message: 'Course order updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Duplicate course
export const duplicateCourse = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { courseId } = req.params;

    // Get the original course with all its modules and lessons
    const { data: originalCourse, error: courseError } = await supabase
      .from('courses')
      .select(`
        *,
        modules (
          *,
          lessons (*)
        )
      `)
      .eq('id', courseId)
      .eq('instructor_id', req.user.instructors[0].id)
      .single();

    if (courseError || !originalCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Get the next order index
    const { count } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('instructor_id', req.user.instructors[0].id);

    // Create the duplicate course
    const { data: duplicatedCourse, error: duplicateError } = await supabase
      .from('courses')
      .insert({
        instructor_id: originalCourse.instructor_id,
        title: `${originalCourse.title} (Copy)`,
        description: originalCourse.description,
        category: originalCourse.category,
        level: originalCourse.level,
        type: originalCourse.type,
        price: originalCourse.price,
        thumbnail_url: originalCourse.thumbnail_url,
        is_published: false, // Always create as unpublished
        order_index: count || 0
      })
      .select()
      .single();

    if (duplicateError) {
      return res.status(400).json({ error: duplicateError.message });
    }

    // Duplicate modules and lessons
    if (originalCourse.modules && originalCourse.modules.length > 0) {
      for (const module of originalCourse.modules) {
        // Create duplicate module
        const { data: duplicatedModule, error: moduleError } = await supabase
          .from('modules')
          .insert({
            course_id: duplicatedCourse.id,
            title: module.title,
            description: module.description,
            order_index: module.order_index
          })
          .select()
          .single();

        if (moduleError) {
          continue;
        }

        // Duplicate lessons
        if (module.lessons && module.lessons.length > 0) {
          for (const lesson of module.lessons) {
            const { error: lessonError } = await supabase
              .from('lessons')
              .insert({
                module_id: duplicatedModule.id,
                title: lesson.title,
                description: lesson.description,
                video_url: lesson.video_url,
                resource_files: lesson.resource_files,
                additional_content: lesson.additional_content,
                allow_preview: lesson.allow_preview,
                order_index: lesson.order_index
              });

            if (lessonError) {
              continue;
            }
          }
        }
      }
    }

    res.status(201).json(duplicatedCourse);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update course
export const updateCourse = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { courseId } = req.params;
    const { title, description, category, level, type, price, thumbnailUrl, publishImmediately } = req.body;

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (level !== undefined) updateData.level = level;
    if (type !== undefined) updateData.type = type;
    if (price !== undefined) updateData.price = type === 'paid' ? price : 0;
    if (thumbnailUrl !== undefined) updateData.thumbnail_url = thumbnailUrl;
    if (publishImmediately !== undefined) updateData.is_published = publishImmediately;

    const { data: course, error } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', courseId)
      .eq('instructor_id', req.user.instructors[0].id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!course) {
      return res.status(404).json({ error: 'Course not found or unauthorized' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete course
export const deleteCourse = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { courseId } = req.params;

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)
      .eq('instructor_id', req.user.instructors[0].id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Toggle course publication
export const toggleCoursePublication = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { courseId } = req.params;

    const { data: currentCourse, error: fetchError } = await supabase
      .from('courses')
      .select('is_published')
      .eq('id', courseId)
      .eq('instructor_id', req.user.instructors[0].id)
      .single();

    if (fetchError) {
      return res.status(400).json({ error: fetchError.message });
    }

    const { data: course, error } = await supabase
      .from('courses')
      .update({
        is_published: !currentCourse.is_published,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId)
      .eq('instructor_id', req.user.instructors[0].id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get course with modules and lessons - WITH PROPER ORDERING
export const getCourseContent = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { courseId } = req.params;

    // First get the course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .eq('instructor_id', req.user.instructors[0].id)
      .single();

    if (courseError) {
      return res.status(400).json({ error: courseError.message });
    }

    // Then get modules with proper ordering
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (modulesError) {
      return res.status(400).json({ error: modulesError.message });
    }

    // Then get lessons for each module with proper ordering
    for (let module of modules) {
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', module.id)
        .order('order_index', { ascending: true });

      if (lessonsError) {
        module.lessons = [];
      } else {
        module.lessons = lessons;
      }
    }

    // Attach modules to course
    course.modules = modules;

    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create module
export const createModule = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { courseId } = req.params;
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Module title is required' });
    }

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .eq('instructor_id', req.user.instructors[0].id)
      .single();

    if (courseError || !course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const { count } = await supabase
      .from('modules')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    const { data: module, error } = await supabase
      .from('modules')
      .insert({
        course_id: courseId,
        title,
        description,
        order_index: count || 0
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(module);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update module
export const updateModule = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { moduleId } = req.params;
    const { title, description } = req.body;

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    const { data: module, error } = await supabase
      .from('modules')
      .update(updateData)
      .eq('id', moduleId)
      .select(`
        *,
        courses!inner(instructor_id)
      `)
      .single();

    if (error || !module || module.courses.instructor_id !== req.user.instructors[0].id) {
      return res.status(400).json({ error: 'Module not found or unauthorized' });
    }

    res.json(module);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete module
export const deleteModule = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { moduleId } = req.params;

    const { data: module, error: fetchError } = await supabase
      .from('modules')
      .select(`
        id,
        courses!inner(instructor_id)
      `)
      .eq('id', moduleId)
      .single();

    if (fetchError || !module || module.courses.instructor_id !== req.user.instructors[0].id) {
      return res.status(404).json({ error: 'Module not found or unauthorized' });
    }

    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', moduleId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create lesson (with file upload middleware)
export const createLesson = [
  upload.array('resourceFiles', 10), // Allow up to 10 files
  async (req, res) => {
    try {
      const supabase = getSupabaseClient();
      const { moduleId } = req.params;
      const { title, description, videoUrl, additionalContent, allowPreview } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Lesson title is required' });
      }

      // Verify module belongs to instructor's course
      const { data: module, error: moduleError } = await supabase
        .from('modules')
        .select(`
          id,
          courses!inner(instructor_id)
        `)
        .eq('id', moduleId)
        .single();

      if (moduleError || !module || module.courses.instructor_id !== req.user.instructors[0].id) {
        return res.status(404).json({ error: 'Module not found or unauthorized' });
      }

      // Upload files if any
      let resourceFiles = [];
      if (req.files && req.files.length > 0) {
        try {
          const uploadPromises = req.files.map(file => uploadFileToStorage(file));
          resourceFiles = await Promise.all(uploadPromises);
        } catch (uploadError) {
          return res.status(400).json({ error: `File upload failed: ${uploadError.message}` });
        }
      }

      // Get the next order index
      const { count } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('module_id', moduleId);

      const { data: lesson, error } = await supabase
        .from('lessons')
        .insert({
          module_id: moduleId,
          title,
          description,
          video_url: videoUrl,
          resource_files: resourceFiles,
          additional_content: additionalContent,
          allow_preview: allowPreview === 'true',
          order_index: count || 0
        })
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(201).json(lesson);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

// Update lesson (with file upload middleware) - COMPLETE FUNCTION
export const updateLesson = [
  upload.array('resourceFiles', 10),
  async (req, res) => {
    try {
      const supabase = getSupabaseClient();
      const { lessonId } = req.params;
      const { title, description, videoUrl, additionalContent, allowPreview, filesToRemove } = req.body;

      

      // Get existing lesson data to preserve order_index
      const { data: existingLesson, error: fetchError } = await supabase
        .from('lessons')
        .select('resource_files, order_index')
        .eq('id', lessonId)
        .single();

      if (fetchError) {
        return res.status(404).json({ error: 'Lesson not found' });
      }

      const updateData = {
        updated_at: new Date().toISOString(),
        order_index: existingLesson.order_index // Preserve order
      };

      // Always update these fields if they are provided
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description || null;
      if (additionalContent !== undefined) updateData.additional_content = additionalContent || null;
      if (allowPreview !== undefined) updateData.allow_preview = allowPreview === 'true' || allowPreview === true;
      
      // Handle video URL - IMPORTANT: Always update if provided, even if empty
      if (videoUrl !== undefined) {
        updateData.video_url = (videoUrl && videoUrl.trim() !== '') ? videoUrl.trim() : null;
        
      }

      let currentFiles = existingLesson?.resource_files || [];

      // Remove files if specified
      if (filesToRemove) {
        try {
          const filesToRemoveArray = JSON.parse(filesToRemove);
          
          if (filesToRemoveArray.length > 0) {
            const supabaseStorage = getSupabaseClient();
            await supabaseStorage.storage
              .from('course-files')
              .remove(filesToRemoveArray);

            currentFiles = currentFiles.filter(file => 
              !filesToRemoveArray.includes(file.fileName)
            );
          }
        } catch (parseError) {
        }
      }

      // Upload new files if any
      if (req.files && req.files.length > 0) {
        try {
          const uploadPromises = req.files.map(file => uploadFileToStorage(file));
          const newFiles = await Promise.all(uploadPromises);
          currentFiles = [...currentFiles, ...newFiles];
        } catch (uploadError) {
          return res.status(400).json({ error: `File upload failed: ${uploadError.message}` });
        }
      }

      updateData.resource_files = currentFiles;

      

      const { data: lesson, error } = await supabase
        .from('lessons')
        .update(updateData)
        .eq('id', lessonId)
        .select(`
          *,
          modules!inner(
            courses!inner(instructor_id)
          )
        `)
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (!lesson || lesson.modules.courses.instructor_id !== req.user.instructors[0].id) {
        return res.status(400).json({ error: 'Lesson not found or unauthorized' });
      }

      
      res.json(lesson);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

// Delete lesson
export const deleteLesson = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { lessonId } = req.params;

    // Verify lesson belongs to instructor's course
    const { data: lesson, error: fetchError } = await supabase
      .from('lessons')
      .select(`
        id,
        resource_files,
        modules!inner(
          courses!inner(instructor_id)
        )
      `)
      .eq('id', lessonId)
      .single();

    if (fetchError || !lesson || lesson.modules.courses.instructor_id !== req.user.instructors[0].id) {
      return res.status(404).json({ error: 'Lesson not found or unauthorized' });
    }

    // Delete files from storage if any
    if (lesson.resource_files && lesson.resource_files.length > 0) {
      const supabaseStorage = getSupabaseClient();
      const filesToDelete = lesson.resource_files.map(file => file.fileName);
      
      await supabaseStorage.storage
        .from('course-files')
        .remove(filesToDelete);
    }

    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};