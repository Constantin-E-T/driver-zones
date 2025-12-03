import { PrismaClient } from '@prisma/client';
import { DEFAULT_ZONES } from '../src/lib/constants';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database with zones...');

    // Clear existing zones
    await prisma.zone.deleteMany();
    console.log('✅ Cleared existing zones');

    // Insert all default zones
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

    console.log(`✅ Seeded ${zones.length} zones`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
