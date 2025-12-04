import { ZoneManager } from '@/components/zone-manager';
import { getCachedZones } from '@/lib/cached-zones';

// Force dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Safely fetch zones, fallback to empty array if database is unavailable
  let zones = [];
  try {
    zones = await getCachedZones();
  } catch (error) {
    console.error('Failed to fetch zones:', error);
  }

  return (
    <main className="flex h-screen w-screen flex-col bg-black overflow-hidden relative pt-14 pb-20 md:pt-16 md:pb-0">
      <ZoneManager initialZones={zones} />
    </main>
  );
}

