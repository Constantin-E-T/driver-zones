'use client';

import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2 } from 'lucide-react';
import { createZone } from '@/actions/zones';
import { toast } from 'sonner';

interface QuickZoneDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    position: { lat: number; lng: number };
    onSuccess: () => void;
}

export function QuickZoneDialog({ open, onOpenChange, position, onSuccess }: QuickZoneDialogProps) {
    const [name, setName] = useState('');
    const [radius, setRadius] = useState('500');
    const [isPending, startTransition] = useTransition();

    const handleCreate = () => {
        if (!name.trim()) {
            toast.error('Please enter a zone name');
            return;
        }

        const radiusNum = parseInt(radius);
        if (isNaN(radiusNum) || radiusNum <= 0) {
            toast.error('Please enter a valid radius');
            return;
        }

        startTransition(async () => {
            const result = await createZone({
                name: name.trim(),
                lat: position.lat,
                lng: position.lng,
                radius: radiusNum,
            });

            if (result.error) {
                toast.error('Failed to create zone');
            } else {
                toast.success(`Zone "${name}" created successfully!`);
                setName('');
                setRadius('500');
                onSuccess();
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <MapPin className="h-5 w-5 text-emerald-500" />
                        </div>
                        Create New Zone
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Enter a name for your zone. Location is automatically set from the map.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                    {/* Zone Name */}
                    <div className="space-y-2">
                        <Label htmlFor="zone-name" className="text-zinc-200 font-medium">
                            Zone Name *
                        </Label>
                        <Input
                            id="zone-name"
                            placeholder="e.g., Downtown, Airport, Station..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                            autoFocus
                            disabled={isPending}
                        />
                    </div>

                    {/* Radius */}
                    <div className="space-y-2">
                        <Label htmlFor="zone-radius" className="text-zinc-200 font-medium">
                            Radius (meters)
                        </Label>
                        <Input
                            id="zone-radius"
                            type="number"
                            placeholder="500"
                            value={radius}
                            onChange={(e) => setRadius(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                            disabled={isPending}
                        />
                        <p className="text-xs text-zinc-500">Default: 500 meters</p>
                    </div>

                    {/* Location Info */}
                    <div className="rounded-lg bg-zinc-800/50 border border-zinc-700/50 p-3 space-y-1">
                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Location (Auto-filled)</p>
                        <p className="text-sm font-mono text-zinc-300">
                            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            onClick={() => onOpenChange(false)}
                            variant="outline"
                            className="flex-1 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            disabled={isPending || !name.trim()}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <MapPin className="h-4 w-4 mr-2" />
                                    Create Zone
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
