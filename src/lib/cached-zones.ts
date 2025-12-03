'use server';

import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

// Cache zones data for 60 seconds with auto-revalidation
export const getCachedZones = unstable_cache(
  async () => {
    const zones = await prisma.zone.findMany({
      orderBy: { name: 'asc' },
    });
    return zones;
  },
  ['zones'],
  {
    revalidate: 60, // Revalidate every 60 seconds
    tags: ['zones'],
  }
);

export const getCachedZoneCount = unstable_cache(
  async () => {
    const count = await prisma.zone.count();
    return count;
  },
  ['zone-count'],
  {
    revalidate: 60,
    tags: ['zones'],
  }
);
