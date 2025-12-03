'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Zone } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ZoneList from '@/components/ZoneList';
import { DEFAULT_ZONES } from '@/lib/constants';

// Dynamically import Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-zinc-900 flex items-center justify-center text-white">Loading Map...</div>
});

export default function Home() {
  const [zones, setZones] = useState<Zone[]>([]);





  // Load zones from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('driver-zones');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If we have saved zones, use them. If it's an empty array (previous session), load defaults.
        if (Array.isArray(parsed) && parsed.length > 0) {
          setZones(parsed);
        } else {
          setZones(DEFAULT_ZONES);
        }
      } catch (e) {
        console.error('Failed to parse zones', e);
        setZones(DEFAULT_ZONES);
      }
    } else {
      // Load default zones if nothing saved
      setZones(DEFAULT_ZONES);
    }
  }, []);

  // Save zones whenever they change
  useEffect(() => {
    localStorage.setItem('driver-zones', JSON.stringify(zones));
  }, [zones]);

  const [isListOpen, setIsListOpen] = useState(false);

  const handleAddZone = (lat: number, lng: number) => {
    // Simple prompt for now - can be upgraded to a modal later
    // We use a timeout to ensure the map click doesn't interfere if triggered that way
    setTimeout(() => {
      const name = window.prompt("Name this zone (e.g., 'Portsmouth Station'):", `Zone ${zones.length + 1}`);
      if (name) {
        const newZone: Zone = {
          id: crypto.randomUUID(),
          name,
          lat,
          lng,
          radius: 500, // Default 500m radius
          createdAt: Date.now(),
        };
        setZones([...zones, newZone]);
      }
    }, 100);
  };

  const handleDeleteZone = (id: string) => {
    if (window.confirm('Delete this zone?')) {
      setZones(zones.filter(z => z.id !== id));
    }
  };

  return (
    <main className="flex h-screen w-screen flex-col bg-black overflow-hidden relative">
      <div className="flex-1 relative h-full w-full">
        <Map zones={zones} onAddZone={handleAddZone} />

        {/* Main Action Button */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] flex gap-4">
          <Button
            size="lg"
            className="rounded-full h-12 w-12 shadow-xl bg-zinc-800 border border-zinc-700 text-white"
            onClick={() => setIsListOpen(true)}
          >
            <span className="font-bold text-lg">≡</span>
          </Button>

          <Button
            size="lg"
            className="rounded-full h-16 w-16 shadow-xl bg-blue-600 hover:bg-blue-700 border-4 border-black/20 text-white"
            onClick={() => {
              navigator.geolocation.getCurrentPosition(pos => {
                handleAddZone(pos.coords.latitude, pos.coords.longitude);
              });
            }}
          >
            <Plus className="h-8 w-8" />
          </Button>
        </div>

        <ZoneList
          zones={zones}
          onDeleteZone={handleDeleteZone}
          isOpen={isListOpen}
          onClose={() => setIsListOpen(false)}
        />
      </div>
    </main>
  );
}
