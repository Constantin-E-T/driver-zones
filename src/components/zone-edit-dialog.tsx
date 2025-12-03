'use client';

import { useState } from 'react';
import { Zone } from '@prisma/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ZoneEditDialogProps {
    zone: Zone;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (id: string, data: Partial<Zone>) => Promise<void>;
}

export function ZoneEditDialog({ zone, open, onOpenChange, onSave }: ZoneEditDialogProps) {
    const [name, setName] = useState(zone.name);
    const [lat, setLat] = useState(zone.lat);
    const [lng, setLng] = useState(zone.lng);
    const [radius, setRadius] = useState(zone.radius);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSave(zone.id, { name, lat, lng, radius });
            onOpenChange(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-white border-zinc-800">
                <DialogHeader>
                    <DialogTitle>Edit Zone</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Make changes to the zone details below.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3 bg-zinc-800 border-zinc-700"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="lat" className="text-right">
                            Lat
                        </Label>
                        <Input
                            id="lat"
                            type="number"
                            value={lat}
                            onChange={(e) => setLat(parseFloat(e.target.value))}
                            className="col-span-3 bg-zinc-800 border-zinc-700"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="lng" className="text-right">
                            Lng
                        </Label>
                        <Input
                            id="lng"
                            type="number"
                            value={lng}
                            onChange={(e) => setLng(parseFloat(e.target.value))}
                            className="col-span-3 bg-zinc-800 border-zinc-700"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="radius" className="text-right">
                            Radius (m)
                        </Label>
                        <Input
                            id="radius"
                            type="number"
                            value={radius}
                            onChange={(e) => setRadius(parseInt(e.target.value))}
                            className="col-span-3 bg-zinc-800 border-zinc-700"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {loading ? 'Saving...' : 'Save changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
