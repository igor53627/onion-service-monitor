export interface OnionService {
  title: string;
  name: string;
  onion_address: string;
  status: 'online' | 'offline' | 'unknown' | string; // string for error-XXX statuses
  prev_status: string;
  last_checked: string | null;
  category?: string;
  description?: string;
  official_website?: string;
  github?: string;
  tags?: string[];
}

export type FilterTag = 'all' | 'online' | 'offline' | 'unknown';
