export type Message = { type: 'success' | 'error'; text: string } | null;

export interface InstructorContact {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
}

export interface CommunitySummary {
  id: string;
  instructorId: string;
  name: string;
  subdirectory: string;
  instructor: InstructorContact;
  stats: {
    totalCourses: number;
    totalStudents: number;
  };
}


