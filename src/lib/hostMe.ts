import { cache } from 'react';
import { hostApi } from '@/lib/api';
import type { HostWording } from '@/lib/eventWords';

export type HostMe = {
  organizer: {
    businessName: string;
    name: string;
    email: string;
    phone: string | null;
    phoneVerified: boolean;
    status: 'pending' | 'approved' | 'suspended';
    commissionPercent: number | null;
    termsAccepted: boolean;
    payments: { connected: boolean };
    /** Registration wording for hosts of sports events. Older APIs leave it out. */
    wording?: HostWording;
  };
};

/** The signed-in host, fetched once per page render (the layout and the page share it). */
export const getHostMe = cache(() => hostApi<HostMe>('/organizer/me'));
