'use client';

import { Zone } from '@prisma/client';
import dynamic from 'next/dynamic';

// Dynamically import Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/Map'), { ssr: false });

interface ZoneManagerProps {
    initialZones: Zone[];
}

export function ZoneManager({ initialZones }: ZoneManagerProps) {
    return (
        <div className="relative w-full h-full">
            <Map zones={initialZones} />
        </div>
    );
}
