export interface AdminEvent {
  id: string;
  title: string;
  smallDescription: string | null;
  type: string;
  startDate: Date;
  endDate: Date;
  location: string | null;
  organizerId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  imageUrl?: string | null;
  organizerName?: string;
}

export interface EventStats {
  total: number;
  upcoming: number;
  past: number;
  draft: number;
  published: number;
  cancelled: number;
}
