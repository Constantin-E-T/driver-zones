'use client';

import { useState } from 'react';
import { Zone } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MapPin, Trash2, Edit, Plus } from 'lucide-react';
import { ZoneEditDialog } from './zone-edit-dialog';
import { cn } from '@/lib/utils';

interface ZoneListProps {
    zones: Zone[];
    onDelete: (id: string) => void;
    onCreate: (name: string, lat: number, lng: number, radius: number) => void;
    onUpdate: (id: string, data: Partial<Zone>) => void;
    markerLocation: { lat: number; lng: number } | null;
}

export function ZoneList({ zones, onDelete, onCreate, onUpdate, markerLocation }: ZoneListProps) {
    const [search, setSearch] = useState('');
    const [editingZone, setEditingZone] = useState<Zone | null>(null);
    const [newZoneName, setNewZoneName] = useState('');

    const filteredZones = zones.filter((zone) =>
        zone.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = () => {
        if (!markerLocation || !newZoneName.trim()) return;
        onCreate(newZoneName, markerLocation.lat, markerLocation.lng, 500);
        setNewZoneName('');
    };

    return (
        <div className="flex flex-col h-full bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    Zones ({zones.length})
                </h2>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder="Search zones..."
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                        className="pl-9 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
                    />
                </div>

                <div className="flex gap-2">
                    <Input
                        placeholder="New zone name..."
                        value={newZoneName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewZoneName(e.target.value)}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                    />
                    <Button
                        onClick={handleCreate}
                        disabled={!markerLocation || !newZoneName.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                {!markerLocation && (
                    <p className="text-xs text-amber-500">
                        * Drag the blue marker on the map to set location
                    </p>
                )}
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2 space-y-2">
                    {filteredZones.map((zone) => (
                        <div
                            key={zone.id}
                            className="group flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 border border-transparent hover:border-zinc-700 transition-all"
                        >
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-zinc-200 truncate">{zone.name}</h3>
                                <p className="text-xs text-zinc-500 font-mono">
                                    {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditingZone(zone)}
                                    className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-700"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDelete(zone.id)}
                                    className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-red-900/20"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {filteredZones.length === 0 && (
                        <div className="p-8 text-center text-zinc-500">
                            No zones found
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
                        onUpdate(id, data);
                        setEditingZone(null);
                    }}
                />
            )}
        </div>
    );
}
