'use client';

import { useEffect, useState } from 'react';
import { Zone } from '@prisma/client';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

// Dynamically import Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/Map'), { ssr: false });

interface ZoneManagerProps {
    initialZones: Zone[];
}

export function ZoneManager({ initialZones }: ZoneManagerProps) {
    const searchParams = useSearchParams();
    const [centerOnZone, setCenterOnZone] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');

        if (lat && lng) {
            setCenterOnZone({
                lat: parseFloat(lat),
                lng: parseFloat(lng),
            });
        } else {
            setCenterOnZone(null);
        }
    }, [searchParams]);

    return (
        <div className="relative w-full h-full">
            <Map zones={initialZones} centerOnZone={centerOnZone} />
        </div>
    );
}
