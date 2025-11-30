const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const id = 'cc9ccf77-bb72-40e4-8711-ab8eff5f2e90';
    console.log(`Attempting to delete app with ID: ${id}`);
    try {
        const deletedApp = await prisma.app.delete({
            where: { id: id },
        });
        console.log('Successfully deleted app:', deletedApp);
    } catch (e) {
        console.error('Error deleting app:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
