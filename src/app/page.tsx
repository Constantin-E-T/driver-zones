import { prisma } from '@/lib/prisma';
import { ZoneManager } from '@/components/zone-manager';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const zones = await prisma.zone.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <main className="flex h-screen w-screen flex-col bg-black overflow-hidden relative">
      <ZoneManager initialZones={zones} />
    </main>
  );
}

