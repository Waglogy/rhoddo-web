export type OrganizerRow = {
  id: string;
  email: string;
  name: string;
  businessName: string;
  phone: string | null;
  phoneVerified: boolean;
  status: 'pending' | 'approved' | 'suspended';
  freeTicketsRemaining: number;
  venueCount: number;
  ticketsSold: number;
  feesToDateINR: number;
  paidINR: number;
  dueINR: number;
  recentFeePayments: Array<{ id: string; amountINR: number; note: string | null; paidAt: string }>;
  createdAt: string;
  approvedAt: string | null;
};
