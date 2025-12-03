'use client';

import { useOptimistic, useTransition, useState } from 'react';
import { Zone } from '@prisma/client';
import dynamic from 'next/dynamic';
import { ZoneList } from '@/components/zone-list';

// Dynamically import Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/map'), { ssr: false });
import { createZone, deleteZone, updateZone } from '@/actions/zones';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface ZoneManagerProps {
    initialZones: Zone[];
}

export function ZoneManager({ initialZones }: ZoneManagerProps) {
    const [zones, addOptimisticZone] = useOptimistic(
        initialZones,
        (state, newZone: Zone | { type: 'delete'; id: string } | { type: 'update'; zone: Zone }) => {
            if ('type' in newZone && newZone.type === 'delete') {
                return state.filter((z) => z.id !== newZone.id);
            }
            if ('type' in newZone && newZone.type === 'update') {
                return state.map((z) => (z.id === newZone.zone.id ? newZone.zone : z));
            }
            return [...state, newZone as Zone];
        }
    );

    const [isPending, startTransition] = useTransition();
    const [markerLocation, setMarkerLocation] = useState<{ lat: number; lng: number } | null>(null);

    const handleCreateZone = async (name: string, lat: number, lng: number, radius: number) => {
        const tempId = crypto.randomUUID();
        const newZone: Zone = {
            id: tempId,
            name,
            lat,
            lng,
            radius,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        startTransition(async () => {
            addOptimisticZone(newZone);
            const result = await createZone({ name, lat, lng, radius });
            if (result.error) {
                toast.error('Failed to create zone');
                // In a real app we'd rollback, but useOptimistic handles the immediate UI state.
                // Revalidation will fix the state eventually.
            } else {
                toast.success('Zone created');
            }
        });
    };

    const handleDeleteZone = async (id: string) => {
        startTransition(async () => {
            addOptimisticZone({ type: 'delete', id });
            const result = await deleteZone(id);
            if (result.error) {
                toast.error('Failed to delete zone');
            } else {
                toast.success('Zone deleted');
            }
        });
    };

    const handleUpdateZone = async (id: string, data: Partial<Zone>) => {
        // Find existing zone to merge with
        const existingZone = zones.find((z) => z.id === id);
        if (!existingZone) return;

        const updatedZone = { ...existingZone, ...data };

        startTransition(async () => {
            addOptimisticZone({ type: 'update', zone: updatedZone });
            const result = await updateZone(id, data);
            if (result.error) {
                toast.error('Failed to update zone');
            } else {
                toast.success('Zone updated');
            }
        });
    };

    return (
        <div className="relative w-full h-full">
            {/* Menu Button */}
            <div className="absolute top-4 left-4 z-[1000]">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="icon" className="h-12 w-12 rounded-full shadow-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800">
                            <Menu className="h-6 w-6 text-white" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[85vw] sm:w-[400px] p-0 bg-zinc-950 border-r border-zinc-800">
                        <SheetHeader className="sr-only">
                            <SheetTitle>Zone Management</SheetTitle>
                        </SheetHeader>
                        <ZoneList
                            zones={zones}
                            onDelete={handleDeleteZone}
                            onCreate={handleCreateZone}
                            onUpdate={handleUpdateZone}
                            markerLocation={markerLocation}
                        />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Full Screen Map */}
            <div className="w-full h-full">
                <Map
                    zones={zones}
                    onLocationChange={setMarkerLocation}
                    onCreateZone={(lat, lng) => setMarkerLocation({ lat, lng })}
                />
            </div>
        </div>
    );
}
