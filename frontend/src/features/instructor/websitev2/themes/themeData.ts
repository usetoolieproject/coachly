import { Theme } from '../types';

export const themes: Theme[] = [
  {
    id: 'start-from-scratch',
    name: 'Start from Scratch',
    description: 'Begin with a blank canvas and build your own custom design',
    category: 'Custom',
    thumbnail: '/themes/blank-thumb.jpg',
    previewImage: '/themes/blank-preview.jpg',
    isBlank: true,
    price: 0,
    isNew: false,
    previewComponent: 'StartFromScratchPreview',
    comingSoon: false
  },
  {
    id: 'professional-coach',
    name: 'Professional Coach',
    description: 'Clean and professional design perfect for business coaches and consultants',
    category: 'Business',
    thumbnail: '/themes/professional-coach-thumb.jpg',
    previewImage: '/themes/professional-coach-preview.jpg',
    price: 0,
    isNew: false,
    previewComponent: 'Theme1Preview',
    comingSoon: false
  },
  {
    id: 'fitness-trainer',
    name: 'Fitness Trainer',
    description: 'Energetic and motivational design for fitness professionals and trainers',
    category: 'Fitness',
    thumbnail: '/themes/fitness-trainer-thumb.jpg',
    previewImage: '/themes/fitness-trainer-preview.jpg',
    price: 0,
    isNew: false,
    previewComponent: 'Theme2Preview',
    comingSoon: false
  },
  {
    id: 'business-mentor',
    name: 'Business Mentor',
    description: 'Corporate and trustworthy design for business mentors and advisors',
    category: 'Business',
    thumbnail: '/themes/business-mentor-thumb.jpg',
    previewImage: '/themes/business-mentor-preview.jpg',
    price: 0,
    isNew: false,
    comingSoon: true
  },
  {
    id: 'creative-artist',
    name: 'Creative Artist',
    description: 'Artistic and creative design for artists, designers, and creative professionals',
    category: 'Creative',
    thumbnail: '/themes/creative-artist-thumb.jpg',
    previewImage: '/themes/creative-artist-preview.jpg',
    price: 0,
    isNew: true,
    comingSoon: true
  },
  {
    id: 'tech-educator',
    name: 'Tech Educator',
    description: 'Modern and tech-focused design for programming and tech instructors',
    category: 'Technology',
    thumbnail: '/themes/tech-educator-thumb.jpg',
    previewImage: '/themes/tech-educator-preview.jpg',
    price: 0,
    isNew: false,
    comingSoon: true
  },
  {
    id: 'wellness-coach',
    name: 'Wellness Coach',
    description: 'Calm and healing design for wellness and life coaches',
    category: 'Wellness',
    thumbnail: '/themes/wellness-coach-thumb.jpg',
    previewImage: '/themes/wellness-coach-preview.jpg',
    price: 0,
    isNew: true,
    comingSoon: true
  },
  {
    id: 'academic-tutor',
    name: 'Academic Tutor',
    description: 'Educational and scholarly design for academic tutors and teachers',
    category: 'Education',
    thumbnail: '/themes/academic-tutor-thumb.jpg',
    previewImage: '/themes/academic-tutor-preview.jpg',
    price: 0,
    isNew: false,
    comingSoon: true
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Simple and clean design with focus on content and typography',
    category: 'General',
    thumbnail: '/themes/minimalist-thumb.jpg',
    previewImage: '/themes/minimalist-preview.jpg',
    price: 0,
    isNew: false,
    comingSoon: true
  }
];

export const getThemesByCategory = (category: string) => {
  return themes.filter(theme => theme.category === category);
};

export const getAllCategories = () => {
  return [...new Set(themes.map(theme => theme.category))];
};
