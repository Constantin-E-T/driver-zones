'use client';

import { useOptimistic, useTransition, useState } from 'react';
import { Zone } from '@prisma/client';
import { Map } from '@/components/map';
import { ZoneList } from '@/components/zone-list';
import { createZone, deleteZone, updateZone } from '@/actions/zones';
import { toast } from 'sonner';

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
        <div className="flex flex-col h-[calc(100vh-4rem)] md:flex-row gap-4 p-4">
            <div className="w-full md:w-2/3 h-[50vh] md:h-full rounded-xl overflow-hidden border border-border shadow-sm">
                <Map
                    zones={zones}
                    onLocationChange={setMarkerLocation}
                    onCreateZone={(lat, lng) => setMarkerLocation({ lat, lng })}
                />
            </div>
            <div className="w-full md:w-1/3 h-[40vh] md:h-full flex flex-col gap-4">
                <ZoneList
                    zones={zones}
                    onDelete={handleDeleteZone}
                    onCreate={handleCreateZone}
                    onUpdate={handleUpdateZone}
                    markerLocation={markerLocation}
                />
            </div>
        </div>
    );
}
