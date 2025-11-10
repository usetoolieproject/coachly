import React from 'react';
import { useDesignColors } from '../../../hooks/useDesignColors';

interface Testimonial {
  id: string;
  studentName: string;
  quote: string;
}

interface TestimonialsProps {
  title?: string;
  testimonials?: Testimonial[];
  alignment?: 'left' | 'center' | 'right';
  padding?: number;
  allSectionData?: any;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    studentName: 'Sarah M.',
    quote: 'This platform has transformed my learning journey. The support and resources are incredible!'
  },
  {
    id: '2', 
    studentName: 'Mike T.',
    quote: 'Best investment I\'ve made in my education. The courses are top-notch and the community is amazing.'
  },
  {
    id: '3',
    studentName: 'Emma L.',
    quote: 'I\'ve learned more here in 3 months than I did in years of self-study. Highly recommended!'
  }
];

export const Testimonials: React.FC<TestimonialsProps> = ({
  title = "What Our Students Say",
  testimonials = defaultTestimonials,
  alignment = 'center',
  allSectionData
}) => {
  const { darkMode } = useDesignColors({ allSectionData });
  // Limit to maximum 3 testimonials
  const displayTestimonials = testimonials.slice(0, 3);

  // Get alignment class
  const getAlignmentClass = (align: string) => {
    switch (align) {
      case 'left': return 'text-left';
      case 'right': return 'text-right';
      case 'center': 
      default: return 'text-center';
    }
  };

  return (
    <div className="my-4 sm:my-6 md:my-8">
      <div className={`rounded-2xl shadow-sm p-4 md:p-5 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h2 
          className={`text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-5 md:mb-6 px-2 sm:px-3 md:px-0 ${getAlignmentClass(alignment)} ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          {title}
        </h2>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {displayTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={`rounded-xl p-4 hover:shadow-md transition-shadow ${
                darkMode 
                  ? 'bg-gray-700' 
                  : 'bg-gray-50'
              }`}
            >
              <p className={`mb-3 md:mb-4 text-sm md:text-base leading-relaxed ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>{testimonial.quote}</p>
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full grid place-content-center text-xs font-semibold ${darkMode ? 'bg-gray-600 text-gray-100' : 'bg-gray-200 text-gray-700'}`}>
                  {testimonial.studentName?.split(' ').map(s=>s[0]).join('').slice(0,2)}
                </div>
                <p className={`font-medium text-sm md:text-base ${
                  darkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>{testimonial.studentName}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};