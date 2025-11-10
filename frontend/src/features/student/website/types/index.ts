export interface Testimonial {
  name: string;
  quote: string;
}

export interface IntroMediaItem {
  id: string;
  type: 'video' | 'image';
  url: string;
  order_index: number;
}

export interface InstructorIntroContent {
  id: string;
  description: string;
  instructor_intro_media_items: IntroMediaItem[];
}

export interface PublicAboutPageData {
  id: string;
  title: string;
  description: string;
  primary_color: string;
  secondary_color: string;
  subdirectory: string;
  custom_domain?: string;
  is_published: boolean;
  banner_url?: string;
  custom_bullets: string[];
  is_paid_community: boolean;
  monthly_price: number;
  included_features: string[];
  testimonials: Testimonial[];
  instructor_intro_content?: InstructorIntroContent[];
  stats: {
    totalCourses: number;
    totalStudents: number;
    rating: number;
  };
  instructor: {
    id: string;
    business_name: string;
    users: {
      first_name: string;
      last_name: string;
      profile_picture_url?: string;
    };
  };
  availableCourses: Array<{
    id: string;
    title: string;
    thumbnail_url?: string;
    description?: string;
  }>;
}

export type CommunityModalStatus = 'already_joined' | 'has_existing_community' | null;

export interface CommunityStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: CommunityModalStatus;
  currentCommunity?: any;
  targetCommunity?: any;
  onConfirmSwitch?: () => void;
  loading?: boolean;
}


