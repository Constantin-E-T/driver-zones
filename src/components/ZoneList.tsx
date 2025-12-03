'use client';

import { Zone } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2, X } from 'lucide-react';

interface ZoneListProps {
    zones: Zone[];
    onDeleteZone: (id: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function ZoneList({ zones, onDeleteZone, isOpen, onClose }: ZoneListProps) {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-x-0 bottom-0 z-[2000] bg-zinc-900 border-t border-zinc-800 rounded-t-xl shadow-2xl max-h-[60vh] flex flex-col transition-transform duration-300 ease-out">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <h2 className="text-lg font-semibold text-white">Your Zones ({zones.length})</h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-white">
                    <X className="h-6 w-6" />
                </Button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {zones.length === 0 ? (
                    <div className="text-center text-zinc-500 py-8">
                        No zones marked yet.
                        <br />
                        Drive to a spot and tap "+" to add one.
                    </div>
                ) : (
                    zones.map((zone) => (
                        <div key={zone.id} className="flex items-center justify-between bg-zinc-800 p-3 rounded-lg border border-zinc-700">
                            <div>
                                <div className="font-medium text-white">{zone.name}</div>
                                <div className="text-xs text-zinc-400">
                                    {new Date(zone.createdAt).toLocaleDateString()} • {zone.radius}m
                                </div>
                            </div>
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => onDeleteZone(zone.id)}
                                className="h-8 w-8 bg-red-900/50 text-red-400 hover:bg-red-900 hover:text-red-200"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
