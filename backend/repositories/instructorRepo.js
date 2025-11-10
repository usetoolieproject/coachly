export const getInstructorIdFromRequest = (req) => {
  return req?.user?.instructors?.[0]?.id;
};


