export type OrganizerRow = {
  id: string;
  email: string;
  name: string;
  businessName: string;
  phone: string;
  status: 'pending' | 'approved' | 'suspended';
  freeTicketsRemaining: number;
  venueCount: number;
  createdAt: string;
  approvedAt: string | null;
};
