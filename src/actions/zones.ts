'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { createZoneSchema, updateZoneSchema, type CreateZoneInput, type UpdateZoneInput } from '@/lib/validations/zone';

export async function createZone(data: CreateZoneInput) {
    const result = createZoneSchema.safeParse(data);

    if (!result.success) {
        return { error: result.error.flatten().fieldErrors };
    }

    try {
        const zone = await prisma.zone.create({
            data: result.data,
        });
        revalidatePath('/');
        revalidatePath('/zones');
        revalidateTag('zones', 'default');
        return { success: true, data: zone };
    } catch (error) {
        console.error('Failed to create zone:', error);
        return { error: 'Failed to create zone' };
    }
}

export async function updateZone(id: string, data: UpdateZoneInput) {
    const result = updateZoneSchema.safeParse(data);

    if (!result.success) {
        return { error: result.error.flatten().fieldErrors };
    }

    try {
        const zone = await prisma.zone.update({
            where: { id },
            data: result.data,
        });
        revalidatePath('/');
        revalidatePath('/zones');
        revalidateTag('zones', 'default');
        return { success: true, data: zone };
    } catch (error) {
        console.error('Failed to update zone:', error);
        return { error: 'Failed to update zone' };
    }
}

export async function deleteZone(id: string) {
    try {
        await prisma.zone.delete({
            where: { id },
        });
        revalidatePath('/');
        revalidatePath('/zones');
        revalidateTag('zones', 'default');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete zone:', error);
        return { error: 'Failed to delete zone' };
    }
}
