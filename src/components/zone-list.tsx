'use client';

import { useOptimistic, useTransition, useState } from 'react';
import { Zone } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MapPin, Trash2, Edit, RotateCcw } from 'lucide-react';
import { ZoneEditDialog } from './zone-edit-dialog';
import { deleteZone, updateZone } from '@/actions/zones';
import { resetZonesToDefaults } from '@/actions/reset-zones';
import { toast } from 'sonner';

interface ZoneListProps {
    zones: Zone[];
    onZoneClick?: (zone: Zone) => void;
}

export function ZoneList({ zones: initialZones, onZoneClick }: ZoneListProps) {
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
    const [search, setSearch] = useState('');
    const [editingZone, setEditingZone] = useState<Zone | null>(null);

    const filteredZones = zones.filter((zone) =>
        zone.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (id: string) => {
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



    const handleUpdate = async (id: string, data: Partial<Zone>) => {
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
        <div className="flex flex-col h-full bg-zinc-950 text-white">
            <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <MapPin className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Zones</h2>
                            <p className="text-sm text-zinc-400">Manage your driver zones</p>
                        </div>
                    </div>
                    <div className="px-3 py-1.5 bg-zinc-800 rounded-lg border border-zinc-700">
                        <span className="text-sm font-medium text-zinc-300">{zones.length} total</span>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search zones..."
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                        className="pl-9 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 h-10"
                    />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-blue-500" />
                            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Create New Zone</h3>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                                if (confirm('Are you sure you want to reset all zones to defaults? This will delete any custom zones.')) {
                                    startTransition(async () => {
                                        const result = await resetZonesToDefaults();
                                        if (result.error) {
                                            toast.error(result.error);
                                        } else {
                                            toast.success(`Reset to ${result.count} default zones`);
                                        }
                                    });
                                }
                            }}
                            className="h-6 text-xs text-zinc-500 hover:text-zinc-300"
                        >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Reset Defaults
                        </Button>
                    </div>
                    {filteredZones.map((zone) => (
                        <div
                            key={zone.id}
                            className="group relative flex items-center justify-between p-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 cursor-pointer"
                            onClick={() => onZoneClick?.(zone)}
                        >
                            <div className="flex-1 min-w-0 pr-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                    <h3 className="font-semibold text-white truncate">{zone.name}</h3>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <div className="flex items-center gap-1.5 text-zinc-400">
                                        <MapPin className="h-3 w-3" />
                                        <span className="font-mono">
                                            {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}
                                        </span>
                                    </div>
                                    <div className="h-3 w-px bg-zinc-700" />
                                    <span className="text-zinc-500">
                                        {zone.radius}m radius
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingZone(zone);
                                    }}
                                    className="h-9 w-9 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                    title="Edit zone"
                                    disabled={isPending}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(zone.id);
                                    }}
                                    className="h-9 w-9 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    title="Delete zone"
                                    disabled={isPending}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {filteredZones.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="p-4 bg-zinc-900 rounded-full mb-4">
                                <MapPin className="h-8 w-8 text-zinc-600" />
                            </div>
                            <p className="text-zinc-300 font-medium mb-1">No zones found</p>
                            <p className="text-zinc-500 text-sm">
                                {search ? 'Try a different search term' : 'Create your first zone to get started'}
                            </p>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {editingZone && (
                <ZoneEditDialog
                    zone={editingZone}
                    open={!!editingZone}
                    onOpenChange={(open) => !open && setEditingZone(null)}
                    onSave={async (id, data) => {
                        handleUpdate(id, data);
                        setEditingZone(null);
                    }}
                />
            )}
        </div>
    );
}
