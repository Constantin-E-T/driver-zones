import { ZoneList } from '@/components/zone-list';
import { getCachedZones } from '@/lib/cached-zones';

export default async function ZonesPage() {
    const zones = await getCachedZones();

    return (
        <main className="flex h-screen w-screen flex-col bg-zinc-950 overflow-hidden pt-14 pb-20 md:pt-16 md:pb-0">
            <ZoneList zones={zones} />
        </main>
    );
}
