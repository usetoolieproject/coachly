import { useAuth } from '../../../../contexts/AuthContext';

export const useInstructorName = () => {
  const { user } = useAuth();
  
  if (!user || user.role !== 'instructor') {
    return 'Instructor';
  }
  
  // Use business name if available, otherwise use first name + last name
  if (user.instructor?.business_name) {
    return user.instructor.business_name;
  }
  
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  if (user.firstName) {
    return user.firstName;
  }
  
  return 'Instructor';
};
