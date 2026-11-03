import Image from 'next/image';

/** The Rhoddo logo: the bloom-R symbol and wordmark. Set the height with a class. */
export function Logo({ className = 'h-8 w-auto' }: { className?: string }) {
  return <Image src="/brand/rhoddo-lockup.svg" alt="Rhoddo" width={634} height={160} className={className} priority />;
}
