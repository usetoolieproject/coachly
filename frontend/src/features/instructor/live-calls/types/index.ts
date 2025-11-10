export interface Call {
  id: string;
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_link: string;
  notes?: string;
  is_cancelled: boolean;
}


