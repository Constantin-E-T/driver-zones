'use server';

import { prisma } from '@/lib/prisma';
import { DEFAULT_ZONES } from '@/lib/constants';
import { revalidatePath } from 'next/cache';

export async function resetZonesToDefaults() {
    try {
        // Delete all existing zones
        await prisma.zone.deleteMany();

        // Insert default zones
        const zones = DEFAULT_ZONES.map((zone) => ({
            id: zone.id,
            name: zone.name,
            lat: zone.lat,
            lng: zone.lng,
            radius: zone.radius,
        }));

        await prisma.zone.createMany({
            data: zones,
        });

        revalidatePath('/');
        revalidatePath('/zones');

        return { success: true, count: zones.length };
    } catch (error) {
        console.error('Failed to reset zones:', error);
        return { error: 'Failed to reset zones' };
    }
}
