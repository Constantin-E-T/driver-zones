import { ZoneManager } from '@/components/zone-manager';
import { getCachedZones } from '@/lib/cached-zones';

export default async function Home() {
  const zones = await getCachedZones();

  return (
    <main className="flex h-screen w-screen flex-col bg-black overflow-hidden relative pt-14 pb-20 md:pt-16 md:pb-0">
      <ZoneManager initialZones={zones} />
    </main>
  );
}

