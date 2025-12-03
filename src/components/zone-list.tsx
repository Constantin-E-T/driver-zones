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
        <div className="flex flex-col h-full bg-zinc-950 text-white">
            <div className="p-6 border-b border-zinc-800 space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2 mt-8">
                    <MapPin className="h-6 w-6 text-blue-500" />
                    Zones
                    <span className="ml-auto text-lg font-normal text-zinc-400">({zones.length})</span>
                </h2>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder="Search zones..."
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                        className="pl-9 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex gap-2">
                        <Input
                            placeholder="New zone name..."
                            value={newZoneName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewZoneName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-blue-500"
                        />
                        <Button
                            onClick={handleCreate}
                            disabled={!markerLocation || !newZoneName.trim()}
                            size="icon"
                            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-zinc-800 disabled:text-zinc-600"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    {!markerLocation && (
                        <p className="text-xs text-amber-400/90 flex items-start gap-1.5">
                            <span className="text-amber-500">⚠</span>
                            <span>Click on the map to set a location for the new zone</span>
                        </p>
                    )}
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                    {filteredZones.map((zone) => (
                        <div
                            key={zone.id}
                            className="group flex items-center justify-between p-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all"
                        >
                            <div className="flex-1 min-w-0 pr-2">
                                <h3 className="font-semibold text-white truncate mb-1">{zone.name}</h3>
                                <p className="text-xs text-zinc-400 font-mono">
                                    {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}
                                </p>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    Radius: {zone.radius}m
                                </p>
                            </div>
                            <div className="flex items-center gap-1 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditingZone(zone)}
                                    className="h-9 w-9 text-zinc-400 hover:text-blue-400 hover:bg-zinc-700/50"
                                    title="Edit zone"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDelete(zone.id)}
                                    className="h-9 w-9 text-zinc-400 hover:text-red-400 hover:bg-red-900/20"
                                    title="Delete zone"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {filteredZones.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <MapPin className="h-12 w-12 text-zinc-700 mb-3" />
                            <p className="text-zinc-400 font-medium">No zones found</p>
                            <p className="text-zinc-600 text-sm mt-1">
                                {search ? 'Try a different search term' : 'Create your first zone'}
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
                        onUpdate(id, data);
                        setEditingZone(null);
                    }}
                />
            )}
        </div>
    );
}
