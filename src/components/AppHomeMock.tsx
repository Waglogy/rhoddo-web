import Image from 'next/image';
import type { ReactNode } from 'react';
import { AutoScrollArea } from './AutoScrollArea';

// A coded recreation of the app's home screen (rhoddo-app-/app/(tabs)/home.tsx)
// in an Android frame, sized at roughly 0.79x the app's 360dp layout.

const PROMOS = ['/app/promo-1.jpg', '/app/promo-2.jpg', '/app/promo-3.jpg'];

const MOODS = [
  { label: 'Live Music', sub: 'gigs & nights', image: '/app/mood-livemusic.jpg', tint: '#D1364B', icon: 'music' },
  { label: 'Food & Dining', sub: 'chef tables', image: '/app/mood-foodanddining.jpg', tint: '#E8B84A', icon: 'food' },
  { label: 'Cultural', sub: 'heritage & rituals', image: '/app/mood-cultural.jpg', tint: '#5B7FB9', icon: 'palette' },
  { label: 'Workshops', sub: 'hands-on', image: '/app/mood-workshops.jpg', tint: '#4A9C7F', icon: 'wrench' },
  { label: 'Festivals', sub: 'seasonal', image: '/app/mood-festivals.jpg', tint: '#E8576A', icon: 'sparkles' },
  { label: 'Sports', sub: 'runs & rides', image: '/app/mood-sports.jpg', tint: '#8CA8D1', icon: 'bike' },
  { label: 'Adventure', sub: 'trek & ride', image: '/app/mood-adventure.jpg', tint: '#2E6E5B', icon: 'signpost' },
  { label: 'Stays & Retreats', sub: 'weekend stays', image: '/app/mood-stays.jpg', tint: '#B88A1F', icon: 'bed' },
] as const;

// Illustrative listings, taken from the app's sample data (src/data/mock.ts).
const THIS_WEEK = [
  { title: 'Himalayan Sound Sessions', when: 'Thursday', district: 'Pelling', price: '₹1,200', image: '/app/mood-livemusic.jpg' },
  { title: 'Phagshapa Chef Table', when: 'Saturday', district: 'Gangtok', price: '₹2,200', image: '/app/mood-foodanddining.jpg' },
  { title: 'Goecha La Ridge Trek', when: 'Sunday', district: 'Yuksom', price: '₹18,000', image: '/app/mood-adventure.jpg' },
];

const RESORT_ROWS = [
  { title: 'Himalayan Sound Sessions', when: 'THURSDAY', district: 'Pelling', price: '₹1,200', image: '/app/mood-livemusic.jpg' },
  { title: 'Pine & Fire Weekend', when: 'NEXT WEEK', district: 'Ravangla', price: '₹4,500', image: '/app/mood-stays.jpg' },
];

// November 2026 starts on a Sunday and has 30 days, so no leading blanks.
const NOVEMBER_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);
const NOVEMBER_FESTIVALS = [
  { day: 1, name: 'Lhabab Duechen' },
  { day: 9, name: 'Laxmi Puja (Deepawali)' },
  { day: 30, name: 'Sakewa (Udhauli)' },
];

const ICONS: Record<string, ReactNode> = {
  music: (
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>
  ),
  food: (
    <>
      <path d="M3 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6a2 2 0 0 0 2 2h3Zm0 0v7" />
    </>
  ),
  palette: (
    <>
      <path d="M12 22a10 10 0 1 1 10-10c0 2.5-2 3-4 3h-2a2 2 0 0 0-1.5 3.3c.6.7.2 3.7-2.5 3.7Z" />
      <circle cx="7.5" cy="11" r=".6" />
      <circle cx="11" cy="7" r=".6" />
      <circle cx="16" cy="8.5" r=".6" />
    </>
  ),
  wrench: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9Z" />
  ),
  sparkles: (
    <>
      <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z" />
      <path d="M19 3v4M21 5h-4" />
    </>
  ),
  bike: (
    <>
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <circle cx="15" cy="5" r="1" />
      <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
    </>
  ),
  signpost: <path d="M12 3v18M5 6h12l3 3-3 3H5Z" />,
  bed: <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />,
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  arrow: <path d="M5 12h14M12 5l7 7-7 7" />,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7.5" />
      <path d="m21 21-4.5-4.5" />
    </>
  ),
  ticket: (
    <>
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2M13 11v2M13 17v2" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="4.5" />
      <path d="M3.5 21.5c.8-4.2 4.3-6.5 8.5-6.5s7.7 2.3 8.5 6.5" />
    </>
  ),
};

function Icon({ name, size = 14 }: { name: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </svg>
  );
}

function StatusBar() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-[38px] items-start justify-between bg-gradient-to-b from-bg from-[68%] to-transparent px-[22px] pt-[8px] text-[10px] font-semibold text-ink">
      <span>9:41</span>
      <span className="flex items-center gap-[5px]">
        <svg viewBox="0 0 16 12" width="13" height="10" fill="currentColor">
          <path d="M8 11.5 0 3.3a11.3 11.3 0 0 1 16 0Z" />
        </svg>
        <svg viewBox="0 0 14 12" width="11" height="10" fill="currentColor">
          <path d="M14 0v12H0Z" />
        </svg>
        <span className="relative h-[9px] w-[17px] rounded-[2.5px] border border-ink/70 p-[1px]">
          <span className="block h-full w-[78%] rounded-[1px] bg-ink" />
          <span className="absolute -right-[2.5px] top-[2px] h-[3px] w-[1.5px] rounded-r-sm bg-ink/70" />
        </span>
      </span>
    </div>
  );
}

function PromoHero() {
  return (
    <div className="relative h-[275px] overflow-hidden rounded-b-[25px] border-b border-ink/20 bg-[#141E1A]">
      {PROMOS.map((src, i) => (
        <div
          key={src}
          className={`promo-slide promo-${i + 1} absolute inset-0 ${i === 0 ? 'opacity-100' : 'opacity-0'}`}
        >
          <Image src={src} alt="" fill sizes="284px" draggable={false} className="object-cover" priority={i === 0} loading={i === 0 ? undefined : 'eager'} />
        </div>
      ))}

      {/* Same legibility scrim as the app */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,21,18,0.62)_0%,rgba(14,21,18,0.08)_45%,rgba(14,21,18,0.94)_100%)]" />

      <div className="absolute right-[19px] top-[36px] flex items-center gap-[6px]">
        <div className="flex items-center gap-[4px] rounded-full border border-gold/45 bg-bg/55 px-[9px] py-[4px] text-[8.5px] font-medium tracking-[0.04em] text-ink/80">
          <svg viewBox="0 0 24 24" width="11" height="11" fill="#E8B84A" stroke="#E8B84A" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="4.5" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
          </svg>
          12° Gangtok
        </div>
        <div className="relative flex h-[32px] w-[32px] items-center justify-center rounded-full border border-[#2D3E37] bg-[#1B2722] text-primary">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 2.5a6.5 6.5 0 0 0-6.5 6.5c0 5-2.5 7-2.5 8h18c0-1-2.5-3-2.5-8A6.5 6.5 0 0 0 12 2.5ZM9.5 19.5a2.5 2.5 0 0 0 5 0Z" />
          </svg>
          <span className="absolute right-[7px] top-[6px] h-[7px] w-[7px] rounded-full border-[1.5px] border-[#1B2722] bg-primary" />
        </div>
        <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full border-[1.5px] border-ink bg-primary text-[9px] font-semibold tracking-[0.04em] text-white">
          TS
        </div>
      </div>

      <div className="absolute inset-x-[19px] bottom-[16px]">
        <div className="text-[10.5px] font-medium text-ink/80">Hello, Tashi</div>
        <div className="mt-[2px] font-display text-[21px] font-bold leading-[25px] tracking-[-0.02em] text-ink">
          What&rsquo;s on tonight?
        </div>
        <div className="mt-[10px] flex items-center gap-[5px]">
          {PROMOS.map((src, i) => (
            <span
              key={src}
              className={`promo-dot promo-${i + 1} h-[5px] rounded-full ${i === 0 ? 'w-[14px] bg-ink' : 'w-[5px] bg-ink/55'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionHead({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="px-[19px]">
      <div className="font-display text-[19px] font-semibold leading-[23px] tracking-[-0.015em] text-ink">
        {title}
      </div>
      <div className="text-[10.5px] leading-[14px] text-ink/50">{subtitle}</div>
    </div>
  );
}

function Moods() {
  return (
    <div className="no-scrollbar mt-[13px] flex gap-[9px] overflow-x-auto px-[19px]">
      {MOODS.map((m) => (
        <div
          key={m.label}
          className="relative h-[133px] w-[118px] shrink-0 overflow-hidden rounded-[14px] border border-ink/10"
        >
          <Image src={m.image} alt="" fill sizes="118px" draggable={false} className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(14,21,18,0.18)_50%,rgba(14,21,18,0.82)_100%)]" />
          <span className="absolute left-[9px] top-[9px] text-white/90">
            <Icon name={m.icon} size={13} />
          </span>
          <div className="absolute inset-x-[11px] bottom-[10px]">
            <span className="mb-[6px] block h-[2.5px] w-[17px] rounded-full" style={{ backgroundColor: m.tint }} />
            <div className="font-display text-[13.5px] font-semibold leading-[16px] text-white">{m.label}</div>
            <div className="mt-[1px] truncate text-[7.5px] font-medium uppercase tracking-[0.05em] text-white/70">
              {m.sub}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FestivalCard() {
  const festivalDays = new Set(NOVEMBER_FESTIVALS.map((f) => f.day));
  return (
    <div className="mx-[19px] mt-[13px] overflow-hidden rounded-[14px] border-[1.5px] border-primary bg-[#1B2722]">
      <div className="flex items-start justify-between bg-gradient-to-b from-gold/10 to-transparent px-[10px] pb-[6px] pt-[10px]">
        <div>
          <div className="text-[8px] font-medium tracking-[0.2em] text-ink/50">2026</div>
          <div className="font-display text-[20px] font-bold leading-[24px] text-ink">November</div>
          <div className="mt-[6px] h-[2.5px] w-[22px] rounded-full bg-primary" />
        </div>
        <div className="flex items-center gap-[3px] rounded-full bg-gold/10 px-[8px] py-[3px] text-[8px] font-medium text-gold">
          <Icon name="star" size={9} />
          3 festivals
        </div>
      </div>

      <div className="grid grid-cols-7 px-[9px] pb-[8px] pt-[4px] text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="flex h-[20px] items-center justify-center text-[8px] font-medium text-ink/50">
            {d}
          </div>
        ))}
        {NOVEMBER_DAYS.map((d) => (
          <div key={d} className="flex h-[20px] items-center justify-center">
            <span
              className={`flex h-[17px] w-[17px] items-center justify-center rounded-full text-[9.5px] font-medium ${
                festivalDays.has(d) ? 'bg-primary/15 text-primary' : 'text-ink'
              }`}
            >
              {d}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-[6px] px-[10px] pb-[10px]">
        {NOVEMBER_FESTIVALS.map((f) => (
          <div key={f.day} className="flex items-center gap-[9px]">
            <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
              <Icon name="star" size={10} />
            </span>
            <div className="min-w-0">
              <div className="truncate text-[10.5px] leading-[14px] text-ink">{f.name}</div>
              <div className="text-[8.5px] font-medium tracking-[0.04em] text-ink/50">
                {String(f.day).padStart(2, '0')} Nov
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeekCards() {
  return (
    <div className="no-scrollbar mt-[13px] flex gap-[9px] overflow-x-auto px-[19px]">
      {THIS_WEEK.map((e) => (
        <div key={e.title} className="w-[182px] shrink-0 overflow-hidden rounded-[14px] border border-[#2D3E37] bg-[#1B2722]">
          <div className="relative h-[118px]">
            <Image src={e.image} alt="" fill sizes="182px" draggable={false} className="object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(14,21,18,0.85))]" />
            <div className="absolute left-[9px] top-[9px] flex items-center gap-[5px] rounded-full border border-ink/20 bg-bg/80 px-[9px] py-[4px] text-[10px] font-medium text-ink">
              {e.when}
              <span className="h-[2.5px] w-[2.5px] rounded-full bg-ink/55" />
              <span className="text-gold">{e.district}</span>
            </div>
          </div>
          <div className="p-[9px]">
            <div className="truncate text-[14px] font-semibold leading-[18px] tracking-[-0.01em] text-ink">{e.title}</div>
            <div className="mt-[6px] text-[10.5px] font-medium text-gold">{e.price}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ResortRows() {
  return (
    <div className="mt-[13px] space-y-[13px] px-[19px]">
      {RESORT_ROWS.map((e) => (
        <div key={e.title} className="flex rounded-[14px] border border-[#2D3E37] bg-[#1B2722] p-[9px]">
          <div className="relative h-[87px] w-[87px] shrink-0 overflow-hidden rounded-[11px]">
            <Image src={e.image} alt="" fill sizes="87px" draggable={false} className="object-cover" />
          </div>
          <div className="ml-[12px] flex min-w-0 flex-1 flex-col justify-between">
            <div>
              <div className="flex items-center gap-[4px] text-[8px] font-medium tracking-[0.05em] text-[#E8576A]">
                {e.when}
                <span className="h-[2.5px] w-[2.5px] rounded-full bg-ink/50" />
                <Icon name="pin" size={8} />
                {e.district}
              </div>
              <div className="mt-[3px] text-[13px] font-semibold leading-[16px] text-ink">{e.title}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-[12px] font-semibold text-gold">{e.price}</div>
              <span className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-primary text-ink">
                <Icon name="arrow" size={11} />
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TabBar() {
  const tabs = [
    { label: 'Search', icon: 'search' },
    { label: 'Tickets', icon: 'ticket' },
    { label: 'Profile', icon: 'person' },
  ];
  const labelClass = 'mt-[2px] text-[7.5px] font-medium tracking-[0.05em]';
  return (
    <div className="pointer-events-none absolute inset-x-[13px] bottom-[13px] z-20 flex justify-around rounded-[25px] border border-ink/10 bg-[#141E1A]/90 px-[6px] pb-[9px] pt-[8px] backdrop-blur-md">
      <div className="flex w-[52px] flex-col items-center text-primary">
        <span className="mb-[5px] h-[2.5px] w-[14px] rounded-full bg-primary" />
        <svg viewBox="0 0 24 24" width="18" height="18">
          <circle cx="12" cy="12" r="10.5" fill="currentColor" />
          <path d="m16.5 7.5-2.8 6.2-6.2 2.8 2.8-6.2Z" fill="#141E1A" />
        </svg>
        <span className={labelClass}>DISCOVER</span>
      </div>
      {tabs.map((t) => (
        <div key={t.label} className="flex w-[52px] flex-col items-center text-ink/50">
          <span className="mb-[5px] h-[2.5px]" />
          <Icon name={t.icon} size={18} />
          <span className={labelClass}>{t.label.toUpperCase()}</span>
        </div>
      ))}
    </div>
  );
}

export function AppHomeMock() {
  return (
    <div className="relative">
      <div
        className="relative h-[650px] w-[304px] select-none rounded-[46px] bg-gradient-to-b from-[#46574F] via-[#1B2521] to-[#34423B] p-[3px] shadow-[0_60px_110px_-35px_rgba(0,0,0,0.9),0_0_90px_-30px_rgba(232,184,74,0.3)]"
      >
        {/* Side buttons: power, then volume rocker */}
        <span className="absolute -right-[2px] top-[138px] h-[62px] w-[3px] rounded-r-sm bg-[#33413A]" />
        <span className="absolute -right-[2px] top-[222px] h-[104px] w-[3px] rounded-r-sm bg-[#33413A]" />

        <div className="h-full rounded-[43px] bg-[#050806] p-[7px]">
          <div className="relative h-full overflow-hidden rounded-[36px] bg-bg">
            <StatusBar />

            {/* Punch-hole camera */}
            <span className="absolute left-1/2 top-[9px] z-40 h-[12px] w-[12px] -translate-x-1/2 rounded-full bg-black ring-1 ring-white/10">
              <span className="absolute left-[3px] top-[3px] h-[3px] w-[3px] rounded-full bg-[#27384F]" />
            </span>

            {/* Scrolls by itself. Hover to scroll with wheel, trackpad or arrow keys; the page takes over at either end. */}
            <AutoScrollArea
              role="region"
              aria-label="Scrollable preview of the Rhoddo Android app home screen, with promotional banners, Browse by mood categories, the Sikkim Festival Calendar and upcoming events"
              tabIndex={0}
              className="no-scrollbar absolute inset-0 overflow-y-auto outline-none"
            >
              <div aria-hidden="true" className="pb-[90px]">
                <PromoHero />

                <div className="mt-[25px]">
                  <SectionHead title="Browse by mood" subtitle="Pick a vibe, not a filter" />
                  <Moods />
                </div>

                <div className="mt-[25px]">
                  <SectionHead title="Sikkim Festival Calendar" subtitle="Festivals & celebrations · 2026" />
                  <FestivalCard />
                </div>

                <div className="mt-[25px]">
                  <SectionHead title="Happening this week" subtitle="Across the state" />
                  <WeekCards />
                </div>

                <div className="mt-[25px]">
                  <SectionHead title="Hosted by resorts" subtitle="Weekend-worthy stays" />
                  <ResortRows />
                </div>
              </div>
            </AutoScrollArea>

            <TabBar />

            {/* Glass reflection */}
            <div className="pointer-events-none absolute inset-0 z-50 bg-[linear-gradient(115deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0)_32%)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
