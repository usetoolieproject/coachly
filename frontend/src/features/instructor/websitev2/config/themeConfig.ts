export interface SectionConfig {
  id: string;
  name: string;
  icon?: string;
  component: string;
  editorFields: EditorField[];
  defaultData: any;
}

export interface EditorField {
  id: string;
  type: 'text' | 'textarea' | 'file' | 'color' | 'number' | 'select' | 'array' | 'radio' | 'checkbox';
  label: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  condition?: string;
  conditional?: {
    field: string;
    value: string;
  };
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
  };
}

export interface ThemeConfig {
  id: string;
  name: string;
  sections: SectionConfig[];
  previewComponent: string;
}

// Theme 1 (Professional Coach) Configuration
export const theme1Config: ThemeConfig = {
  id: 'professional-coach',
  name: 'Professional Coach',
  previewComponent: 'Theme1Preview',
  sections: [
    {
      id: 'hero',
      name: 'Hero Section',
      icon: 'Star',
      component: 'Hero',
      defaultData: {
        title: 'Professional Coach',
        subtitle: 'Welcome to your professional website',
        buttonText: 'Get Started',
        alignment: 'center',
        width: 'full',
        height: 'auto'
      },
      editorFields: [
        {
          id: 'title',
          type: 'text',
          label: 'Title',
          placeholder: 'Enter your title...',
          validation: { required: true, maxLength: 100 }
        },
        {
          id: 'subtitle',
          type: 'textarea',
          label: 'Subtitle',
          placeholder: 'Enter your subtitle...',
          validation: { maxLength: 500 }
        },
        {
          id: 'buttonText',
          type: 'text',
          label: 'Button Text',
          placeholder: 'Enter button text...'
        }
      ]
    },
    {
      id: 'banner',
      name: 'Banner Section',
      icon: 'Image',
      component: 'Banner',
      defaultData: {
        bannerUrl: '',
        bannerHeight: '250px'
      },
      editorFields: [
        {
          id: 'bannerUrl',
          type: 'file',
          label: 'Upload Banner Image',
          placeholder: 'Select banner image...'
        }
      ]
    },
    {
      id: 'about-join-combined',
      name: 'About + Join Community',
      icon: 'Users',
      component: 'AboutJoinCombined',
      defaultData: {
        // Editor mode
        editorMode: 'about',
        
        // About section data
        aboutTitle: "About",
        aboutDescription: "Welcome to my learning community! Join a thriving community of learners and get access to exclusive content, direct support, and connect with fellow students on the same learning journey.",
        aboutFeatures: [
          "Comprehensive courses with lifetime access",
          "Active community with 24/7 peer support",
          "Regular live Q&A sessions and coaching calls",
          "Exclusive resources and member-only content"
        ],
        
        // Join Community section data
        joinTitle: "Ins Tructor's Learning Community",
        joinMembers: 0,
        joinSupport: '24/7',
        joinCourses: 8,
        joinPrice: 0,
        joinButtonText: 'JOIN COMMUNITY',
        position: 'about-left'
      },
      editorFields: [
        {
          id: 'editorMode',
          type: 'select',
          label: 'Edit Mode',
          options: [
            { value: 'about', label: 'About Section' },
            { value: 'join', label: 'Join Community Section' }
          ]
        },
        {
          id: 'aboutDescription',
          type: 'textarea',
          label: 'Welcome Description',
          placeholder: 'Enter welcome description...',
          condition: 'editorMode === "about"'
        },
        {
          id: 'aboutFeatures',
          type: 'array',
          label: 'Benefit Points',
          placeholder: 'Add benefit point...',
          condition: 'editorMode === "about"'
        },
      ]
    },
    {
      id: 'video',
      name: 'Video Section',
      icon: 'Video',
      component: 'Video',
      defaultData: {
        title: 'Video',
        videoUrl: '',
        layout: 'container',
        alignment: 'center'
      },
      editorFields: [
        {
          id: 'title',
          type: 'text',
          label: 'Section Title',
          placeholder: 'Enter section title...'
        },
        {
          id: 'videoUrl',
          type: 'text',
          label: 'Video URL',
          placeholder: 'https://youtube.com/watch?v=...'
        },
        {
          id: 'layout',
          type: 'select',
          label: 'Layout',
          options: [
            { value: 'full', label: 'Full Width' },
            { value: 'container', label: 'Container' }
          ]
        }
      ]
    },
    {
      id: 'offer-box',
      name: 'Offer Box',
      icon: 'Gift',
      component: 'OfferBox',
      defaultData: {
        title: "",
        linkText: "Already have an account? Sign in",
        communityType: 'paid',
        monthlyPrice: 0
      },
      editorFields: [
        {
          id: 'title',
          type: 'text',
          label: 'Title',
          placeholder: 'Enter title...'
        },
        {
          id: 'linkText',
          type: 'text',
          label: 'Link Text',
          placeholder: 'Enter link text...'
        },
        {
          id: 'communityType',
          type: 'radio',
          label: 'Community Type',
          options: [
            { value: 'free', label: 'Free' },
            { value: 'paid', label: 'Paid' }
          ]
        },
        {
          id: 'monthlyPrice',
          type: 'number',
          label: 'Monthly Price ($)',
          placeholder: 'Enter monthly price...',
          conditional: {
            field: 'communityType',
            value: 'paid'
          }
        },
      ]
    },
     {
       id: 'design',
       name: 'Design',
       icon: 'Palette',
       component: 'Design',
       defaultData: {
         primaryColor: '#8b5cf6',
         secondaryColor: '#3b82f6',
         darkMode: false
       },
       editorFields: [
         {
           id: 'primaryColor',
           type: 'color',
           label: 'Primary Color'
         },
         {
           id: 'secondaryColor',
           type: 'color',
           label: 'Secondary Color'
         },
         {
           id: 'darkMode',
           type: 'checkbox',
           label: 'Dark Mode'
         }
       ]
     },
    {
      id: 'domain',
      name: 'Domain',
      icon: 'Globe2',
      component: 'Domain',
      defaultData: {
        customDomain: '',
        subdomain: 'your-community'
      },
      editorFields: [
        {
          id: 'customDomain',
          type: 'text',
          label: 'Custom Domain',
          placeholder: 'Enter your custom domain...'
        },
        {
          id: 'subdomain',
          type: 'text',
          label: 'Subdomain',
          placeholder: 'your-community'
        }
      ]
    },
    {
      id: 'testimonials',
      name: 'Testimonials',
      icon: 'MessageSquare',
      component: 'Testimonials',
      defaultData: {
        title: 'What Our Students Say',
        testimonials: [
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
        ],
        alignment: 'center'
      },
      editorFields: [
        {
          id: 'title',
          type: 'text',
          label: 'Section Title',
          placeholder: 'Enter section title...'
        },
        {
          id: 'testimonials',
          type: 'array',
          label: 'Testimonials',
          placeholder: 'Add testimonial...'
        }
      ]
    },
    {
      id: 'whats-included',
      name: "What's Included",
      icon: 'Package',
      component: 'WhatsIncluded',
      defaultData: {
        title: "What's Included",
        items: [
          {
            id: 'courses',
            title: 'Courses',
            description: '0 comprehensive courses', // Will be updated dynamically
            icon: 'courses'
          },
          {
            id: 'community',
            title: 'Community',
            description: '24/7 peer support & networking',
            icon: 'community'
          },
          {
            id: 'sessions',
            title: 'Live Sessions',
            description: 'Regular Q&A and coaching',
            icon: 'sessions'
          }
        ],
        alignment: 'left',
        showCourses: true,
        showCommunity: true,
        showSessions: true
      },
      editorFields: [
        {
          id: 'title',
          type: 'text',
          label: 'Section Title',
          placeholder: 'Enter section title...'
        },
        {
          id: 'showCourses',
          type: 'checkbox',
          label: 'Show Courses'
        },
        {
          id: 'showCommunity',
          type: 'checkbox',
          label: 'Show Community'
        },
        {
          id: 'showSessions',
          type: 'checkbox',
          label: 'Show Live Sessions'
        }
      ]
    },
    {
      id: 'domain',
      name: 'Domain',
      icon: 'Globe',
      component: 'Domain',
      defaultData: {
        title: 'Domain',
        content: 'Configure your domain and hosting settings.',
        alignment: 'left',
        width: 'full',
        height: 'auto',
        backgroundColor: '#FFFFFF'
      },
      editorFields: [
        {
          id: 'title',
          type: 'text',
          label: 'Section Title',
          placeholder: 'Enter section title...'
        },
        {
          id: 'content',
          type: 'textarea',
          label: 'Content',
          placeholder: 'Enter section content...'
        },
        {
          id: 'backgroundColor',
          type: 'color',
          label: 'Background Color'
        }
      ]
    },
    {
      id: 'add-new',
      name: 'Custom Section',
      icon: 'Plus',
      component: 'CustomSection',
      defaultData: {
        title: 'Custom Section',
        content: 'Your custom content section.',
        alignment: 'left',
        width: 'full',
        height: 'auto',
        backgroundColor: '#F3F4F6'
      },
      editorFields: [
        {
          id: 'title',
          type: 'text',
          label: 'Section Title',
          placeholder: 'Enter section title...'
        },
        {
          id: 'content',
          type: 'textarea',
          label: 'Content',
          placeholder: 'Enter section content...'
        },
        {
          id: 'backgroundColor',
          type: 'color',
          label: 'Background Color'
        }
      ]
    },
    {
      id: 'privacy-section',
      name: 'Privacy Policy',
      icon: 'Shield',
      component: 'PrivacySection',
      defaultData: {},
      editorFields: []
    },
    {
      id: 'terms-section',
      name: 'Terms of Service',
      icon: 'FileText',
      component: 'TermsSection',
      defaultData: {},
      editorFields: []
    }
  ]
};

// Theme 2 (Fitness Trainer) Configuration - Example for future themes
export const theme2Config: ThemeConfig = {
  id: 'fitness-trainer',
  name: 'Fitness Trainer',
  previewComponent: 'Theme2Preview',
  sections: [
    // Similar structure but with fitness-specific sections
    {
      id: 'hero',
      name: 'Hero Section',
      icon: 'Zap',
      component: 'Hero',
      defaultData: {
        title: 'Transform Your Fitness',
        subtitle: 'Get fit with personalized training',
        buttonText: 'Start Training',
        alignment: 'center',
        backgroundColor: '#FF6B35',
        textColor: '#FFFFFF'
      },
      editorFields: [
        // Similar fields but fitness-focused
      ]
    }
    // ... other fitness-specific sections
  ]
};

// Start from Scratch Configuration - reuses theme1 sections
export const startFromScratchConfig: ThemeConfig = {
  id: 'start-from-scratch',
  name: 'Start from Scratch',
  previewComponent: 'StartFromScratchPreview',
  sections: theme1Config.sections // Reuse all sections from theme1
};

// Fitness Trainer Configuration
export const fitnessTrainerConfig: ThemeConfig = {
  id: 'fitness-trainer',
  name: 'Fitness Trainer',
  previewComponent: 'Theme2Preview',
  sections: [
    {
      id: 'hero',
      name: 'Fitness Hero',
      icon: 'Zap',
      component: 'FitnessHero',
      defaultData: {
        headline: 'Transform Your Body',
        tagline: 'START YOUR JOURNEY',
        description: 'Join thousands who have transformed their lives with our proven fitness programs',
        ctaText: 'Get Started Today',
        secondaryCtaText: 'Watch Video',
        alignment: 'left',
        backgroundImage: '',
        showStats: true
      },
      editorFields: [
        {
          id: 'headline',
          type: 'text',
          label: 'Headline',
          placeholder: 'Enter headline...',
          validation: { required: true, maxLength: 100 }
        },
        {
          id: 'tagline',
          type: 'text',
          label: 'Tagline',
          placeholder: 'Enter tagline...'
        },
        {
          id: 'description',
          type: 'textarea',
          label: 'Description',
          placeholder: 'Enter description...'
        },
        {
          id: 'ctaText',
          type: 'text',
          label: 'Primary Button Text',
          placeholder: 'Get Started Today'
        },
        {
          id: 'backgroundImage',
          type: 'file',
          label: 'Background Image',
          placeholder: 'Upload background image...'
        }
      ]
    },
    {
      id: 'banner',
      name: 'Fitness Banner',
      icon: 'Image',
      component: 'FitnessBanner',
      defaultData: {
        bannerUrl: '',
        bannerHeight: '400px',
        overlayText: '',
        overlayTextColor: '#FFFFFF',
        showOverlay: true
      },
      editorFields: [
        {
          id: 'bannerUrl',
          type: 'file',
          label: 'Upload Banner Image',
          placeholder: 'Select banner image...'
        },
        {
          id: 'overlayText',
          type: 'text',
          label: 'Overlay Text',
          placeholder: 'Enter motivational text...'
        }
      ]
    },
    {
      id: 'trainer-about',
      name: 'About Trainer',
      icon: 'User',
      component: 'TrainerAbout',
      defaultData: {
        trainerName: 'Your Name',
        trainerTitle: 'Certified Fitness Trainer',
        trainerBio: 'With over 10 years of experience in fitness and nutrition, I help people achieve their fitness goals through personalized training programs.',
        trainerImage: '',
        credentials: ['NASM Certified', 'CPR Certified', 'Nutrition Specialist'],
        showCredentials: true,
        layout: 'split-left'
      },
      editorFields: [
        {
          id: 'trainerName',
          type: 'text',
          label: 'Trainer Name',
          placeholder: 'Enter your name...'
        },
        {
          id: 'trainerTitle',
          type: 'text',
          label: 'Title',
          placeholder: 'Certified Fitness Trainer...'
        },
        {
          id: 'trainerBio',
          type: 'textarea',
          label: 'Bio',
          placeholder: 'Enter bio...'
        },
        {
          id: 'trainerImage',
          type: 'file',
          label: 'Trainer Photo',
          placeholder: 'Upload photo...'
        },
        {
          id: 'credentials',
          type: 'array',
          label: 'Credentials',
          placeholder: 'Add credential...'
        }
      ]
    },
    {
      id: 'workout-plans',
      name: 'Workout Plans',
      icon: 'Activity',
      component: 'WorkoutPlans',
      defaultData: {
        title: 'Choose Your Program',
        subtitle: 'Select the perfect training plan for your goals',
        plans: [
          {
            id: '1',
            name: 'Beginner',
            description: 'Perfect for those just starting out',
            price: 49,
            isFree: false,
            features: ['4 week program', 'Basic nutrition guide', 'Email support']
          },
          {
            id: '2',
            name: 'Intermediate',
            description: 'For those ready to level up',
            price: 79,
            isFree: false,
            features: ['8 week program', 'Advanced nutrition', 'Weekly check-ins']
          },
          {
            id: '3',
            name: 'Advanced',
            description: 'Maximum results in minimum time',
            price: 119,
            isFree: false,
            features: ['12 week program', 'Personalized nutrition', '24/7 support']
          }
        ]
      },
      editorFields: [
        {
          id: 'title',
          type: 'text',
          label: 'Section Title',
          placeholder: 'Enter title...'
        },
        {
          id: 'plans',
          type: 'array',
          label: 'Workout Plans',
          placeholder: 'Add workout plan...'
        }
      ]
    },
    {
      id: 'video',
      name: 'Video',
      icon: 'Video',
      component: 'FitnessVideo',
      defaultData: {
        title: 'Watch Our Training',
        videoUrl: '',
        height: '600px',
        layout: 'full',
        alignment: 'center',
        showOverlay: true
      },
      editorFields: [
        {
          id: 'title',
          type: 'text',
          label: 'Section Title',
          placeholder: 'Enter section title...'
        },
        {
          id: 'videoUrl',
          type: 'text',
          label: 'Video URL',
          placeholder: 'https://youtube.com/watch?v=...'
        },
        {
          id: 'layout',
          type: 'select',
          label: 'Layout',
          options: [
            { value: 'full', label: 'Full Width' },
            { value: 'container', label: 'Container' }
          ]
        }
      ]
    },
    {
      id: 'transformation-gallery',
      name: 'Transformation Gallery',
      icon: 'Image',
      component: 'TransformationGallery',
      defaultData: {
        title: 'Real Results',
        subtitle: 'See the transformations of our clients',
        transformations: [],
        layout: 'grid'
      },
      editorFields: [
        {
          id: 'title',
          type: 'text',
          label: 'Section Title',
          placeholder: 'Enter title...'
        },
        {
          id: 'transformations',
          type: 'array',
          label: 'Transformations',
          placeholder: 'Add transformation...'
        }
      ]
    },
    {
      id: 'testimonials',
      name: 'Testimonials',
      icon: 'MessageSquare',
      component: 'FitnessTestimonials',
      defaultData: {
        title: 'What Our Clients Say',
        testimonials: [
          {
            id: '1',
            clientName: 'Sarah M.',
            clientImage: '',
            quote: 'I lost 30 pounds in 3 months! The program was exactly what I needed.',
            results: 'Lost 30 lbs'
          },
          {
            id: '2',
            clientName: 'Mike T.',
            clientImage: '',
            quote: 'Best fitness program I\'ve ever tried. Highly recommend!',
            results: 'Gained 20 lbs muscle'
          }
        ],
        alignment: 'center'
      },
      editorFields: [
        {
          id: 'title',
          type: 'text',
          label: 'Section Title',
          placeholder: 'Enter section title...'
        },
        {
          id: 'testimonials',
          type: 'array',
          label: 'Testimonials',
          placeholder: 'Add testimonial...'
        }
      ]
    },
    {
      id: 'whats-included',
      name: "What's Included",
      icon: 'Package',
      component: 'FitnessWhatsIncluded',
      defaultData: {
        title: "What's Included",
        showWorkoutPlans: true,
        showNutritionGuide: true,
        show247Support: true
      },
      editorFields: [
        {
          id: 'title',
          type: 'text',
          label: 'Section Title',
          placeholder: "What's Included"
        },
        {
          id: 'showWorkoutPlans',
          type: 'checkbox',
          label: 'Show Workout Plans'
        },
        {
          id: 'showNutritionGuide',
          type: 'checkbox',
          label: 'Show Nutrition Guide'
        },
        {
          id: 'show247Support',
          type: 'checkbox',
          label: 'Show 24/7 Support'
        }
      ]
    },
    {
      id: 'testimonials',
      name: 'Testimonials',
      icon: 'MessageSquare',
      component: 'FitnessTestimonials',
      defaultData: {
        title: 'What Our Clients Say',
        testimonials: [
          {
            id: '1',
            clientName: 'Sarah M.',
            clientImage: '',
            quote: 'I lost 30 pounds in 3 months! The program was exactly what I needed.',
            results: 'Lost 30 lbs'
          },
          {
            id: '2',
            clientName: 'Mike T.',
            clientImage: '',
            quote: 'Best fitness program I\'ve ever tried. Highly recommend!',
            results: 'Gained 20 lbs muscle'
          }
        ],
        alignment: 'center'
      },
      editorFields: [
        {
          id: 'title',
          type: 'text',
          label: 'Section Title',
          placeholder: 'Enter section title...'
        },
        {
          id: 'testimonials',
          type: 'array',
          label: 'Testimonials',
          placeholder: 'Add testimonial...'
        }
      ]
    },
    {
      id: 'offer-box',
      name: 'Offer Box',
      icon: 'Gift',
      component: 'OfferBox',
      defaultData: {
        title: '',
        linkText: 'Already have an account? Sign in',
        communityType: 'free',
        monthlyPrice: 0
      },
      editorFields: [
        {
          id: 'title',
          type: 'text',
          label: 'Title',
          placeholder: 'Enter title...'
        },
        {
          id: 'communityType',
          type: 'radio',
          label: 'Community Type',
          options: [
            { value: 'free', label: 'Free' },
            { value: 'paid', label: 'Paid' }
          ]
        }
      ]
    },
    {
      id: 'design',
      name: 'Design',
      icon: 'Palette',
      component: 'Design',
      defaultData: {
        primaryColor: '#FF6B35',
        secondaryColor: '#1A1A1A',
        darkMode: false
      },
      editorFields: [
        {
          id: 'primaryColor',
          type: 'color',
          label: 'Primary Color'
        },
        {
          id: 'secondaryColor',
          type: 'color',
          label: 'Secondary Color'
        },
        {
          id: 'darkMode',
          type: 'checkbox',
          label: 'Dark Mode'
        }
      ]
    },
    {
      id: 'domain',
      name: 'Domain',
      icon: 'Globe2',
      component: 'Domain',
      defaultData: {
        customDomain: '',
        subdomain: 'your-community'
      },
      editorFields: [
        {
          id: 'customDomain',
          type: 'text',
          label: 'Custom Domain',
          placeholder: 'Enter your custom domain...'
        },
        {
          id: 'subdomain',
          type: 'text',
          label: 'Subdomain',
          placeholder: 'your-community'
        }
      ]
    },
    {
      id: 'privacy-section',
      name: 'Privacy Policy',
      icon: 'Shield',
      component: 'PrivacySection',
      defaultData: {},
      editorFields: []
    },
    {
      id: 'terms-section',
      name: 'Terms of Service',
      icon: 'FileText',
      component: 'TermsSection',
      defaultData: {},
      editorFields: []
    }
  ]
};

// Export all theme configurations
export const themeConfigs: { [key: string]: ThemeConfig } = {
  'professional-coach': theme1Config,
  'fitness-trainer': fitnessTrainerConfig,
  'start-from-scratch': startFromScratchConfig
};

// Helper functions
export const getThemeConfig = (themeId: string): ThemeConfig | null => {
  return themeConfigs[themeId] || null;
};

export const getSectionConfig = (themeId: string, sectionId: string): SectionConfig | null => {
  const theme = getThemeConfig(themeId);
  return theme?.sections.find(section => section.id === sectionId) || null;
};

export const getSectionsForPageType = (themeId: string, pageType: string): SectionConfig[] => {
  const theme = getThemeConfig(themeId);
  if (!theme) return [];

  switch (pageType) {
    case 'sales-page':
      return theme.sections.filter(section => 
        ['hero', 'banner', 'offer-box', 'about-join-combined', 'video', 'whats-included', 'testimonials', 'design', 'domain', 'add-new'].includes(section.id)
      );
    case 'privacy-policy':
      return theme.sections.filter(section => section.id === 'privacy-section');
    case 'terms-of-service':
      return theme.sections.filter(section => section.id === 'terms-section');
    default:
      return theme.sections;
  }
};
