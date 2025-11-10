export type SocialPost = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  platform: string;
  title?: string;
  status: 'Draft' | 'Scheduled' | 'Published';
  media_link?: string;
  copy?: string;
};


