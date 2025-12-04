'use client';

import { Zone } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { ZoneList } from './zone-list';

interface ZoneListWithNavigationProps {
    zones: Zone[];
}

export function ZoneListWithNavigation({ zones }: ZoneListWithNavigationProps) {
    const router = useRouter();

    const handleZoneClick = (zone: Zone) => {
        // Navigate to map with zone coordinates in URL
        router.push(`/?lat=${zone.lat}&lng=${zone.lng}&zoom=16`);
    };

    return <ZoneList zones={zones} onZoneClick={handleZoneClick} />;
}
