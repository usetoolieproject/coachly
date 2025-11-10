import { apiFetch } from '../../../../services/api';

// For FormData calls, do not send Content-Type; browser sets boundary.

export interface Course {
  id: string;
  title: string;
  description?: string;
  category: string;
  level: string;
  type: string;
  price?: number;
  thumbnail_url?: string;
  is_published: boolean;
  created_at: string;
  order_index: number;
  modules?: Module[];
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  video_url?: string;
  resource_files?: any[];
  additional_content?: string;
  allow_preview: boolean;
  order_index: number;
}

// Course API calls
export const courseService = {
  async getCourses(): Promise<Course[]> {
    return await apiFetch('/courses');
  },

  async createCourse(courseData: any): Promise<Course> {
    return await apiFetch('/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData)
    });
  },

  async updateCourse(courseId: string, courseData: any): Promise<Course> {
    return await apiFetch(`/courses/${courseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData)
    });
  },

  async deleteCourse(courseId: string): Promise<void> {
    return await apiFetch(`/courses/${courseId}`, { method: 'DELETE' });
  },

  async toggleCoursePublication(courseId: string): Promise<Course> {
    return await apiFetch(`/courses/${courseId}/toggle-publication`, { method: 'PATCH' });
  },

  async getCourseContent(courseId: string): Promise<Course> {
    return await apiFetch(`/courses/${courseId}`);
  },

  // Alias for getCourseContent to match hook usage
  async getCourseContentOpen(courseId: string): Promise<Course> {
    return this.getCourseContent(courseId);
  },

  // Course order and duplication
  async updateCourseOrder(courseId: string, direction: 'left' | 'right'): Promise<void> {
    return await apiFetch(`/courses/${courseId}/order`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction })
    });
  },

  async duplicateCourse(courseId: string): Promise<Course> {
    return await apiFetch(`/courses/${courseId}/duplicate`, { method: 'POST' });
  },

  // Module API calls
  async createModule(courseId: string, moduleData: any): Promise<Module> {
    return await apiFetch(`/courses/${courseId}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(moduleData)
    });
  },

  async updateModule(moduleId: string, moduleData: any): Promise<Module> {
    return await apiFetch(`/modules/${moduleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(moduleData)
    });
  },

  async deleteModule(moduleId: string): Promise<void> {
    return await apiFetch(`/modules/${moduleId}`, { method: 'DELETE' });
  },

  async duplicateModule(moduleId: string): Promise<Module> {
    return await apiFetch(`/modules/${moduleId}/duplicate`, { method: 'POST' });
  },

  // Lesson API calls
  async createLesson(moduleId: string, lessonData: any): Promise<Lesson> {
    const formData = new FormData();
    
    // Add text fields
    formData.append('title', lessonData.title);
    if (lessonData.description) formData.append('description', lessonData.description);
    if (lessonData.videoUrl) formData.append('videoUrl', lessonData.videoUrl);
    if (lessonData.additionalContent) formData.append('additionalContent', lessonData.additionalContent);
    formData.append('allowPreview', lessonData.allowPreview.toString());
    
    // Add files
    if (lessonData.resourceFiles && lessonData.resourceFiles.length > 0) {
      lessonData.resourceFiles.forEach((file: File) => {
        formData.append('resourceFiles', file);
      });
    }

    return await apiFetch(`/modules/${moduleId}/lessons`, { method: 'POST', body: formData });
  },

  async updateLesson(lessonId: string, lessonData: any): Promise<Lesson> {
    const formData = new FormData();
    
    // Add text fields - make sure videoUrl is always added
    formData.append('title', lessonData.title);
    formData.append('description', lessonData.description || '');
    formData.append('videoUrl', lessonData.videoUrl || ''); // Always append, even if empty
    formData.append('additionalContent', lessonData.additionalContent || '');
    formData.append('allowPreview', lessonData.allowPreview.toString());
    
    // Add files to remove
    if (lessonData.filesToRemove && lessonData.filesToRemove.length > 0) {
      formData.append('filesToRemove', JSON.stringify(lessonData.filesToRemove));
    }
    
    // Add new files
    if (lessonData.resourceFiles && lessonData.resourceFiles.length > 0) {
      lessonData.resourceFiles.forEach((file: File) => {
        formData.append('resourceFiles', file);
      });
    }

    

    return await apiFetch(`/lessons/${lessonId}`, { method: 'PUT', body: formData });
  },

  async deleteLesson(lessonId: string): Promise<void> {
    return await apiFetch(`/lessons/${lessonId}`, { method: 'DELETE' });
  },

  async duplicateLesson(lessonId: string): Promise<Lesson> {
    return await apiFetch(`/lessons/${lessonId}/duplicate`, { method: 'POST' });
  },

  async moveLessonToModule(lessonId: string, newModuleId: string): Promise<Lesson> {
    return await apiFetch(`/lessons/${lessonId}/move`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newModuleId })
    });
  },
};
