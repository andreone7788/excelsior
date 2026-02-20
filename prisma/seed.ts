import { PrismaClient, Role, BookingStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    // Admin User
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
        where: { email: 'andrea@test.com' },
        update: {},
        create: {
            name: "Andrea",
            surname: "Vandero",
            email: "andrea@test.com",
            password: hashedPassword,
            role: Role.ADMIN
        }
    });
    console.log("Admin created:", admin.email);

    // Standard User
    const hashedPassword2 = await bcrypt.hash("user123", 10);
    const user = await prisma.user.upsert({
        where: { email: 'michele@test.com' },
        update: {},
        create: {
            name: "Michele",
            surname: "Vandero",
            email: "user@test.com",
            password: hashedPassword2,
            role: Role.USER
        }
    });
    console.log("User created:", user.email);

    // Rooms di prova
    const room1 = await prisma.room.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: "Celentano",
            description: "Camera ispirata al grande Adriano Celentano...",
            price: 50.00,
            imageUrl: "https://example.com/celentano.jpg",
            capacity: 2,
            isAvailable: true
        }
    });

    const room2 = await prisma.room.upsert({
        where: { id: 2 },
        update: {},
        create: {
            name: "Montesano",
            description: "Camera dedicata al mitico Enrico Montesano...",
            price: 60.00,
            imageUrl: "https://example.com/montesano.jpg",
            capacity: 2,
            isAvailable: true
        }
    });
    console.log("Rooms created:", room1.name, room2.name);

    // Prenotazione di test
    const booking = await prisma.booking.upsert({
        where: { id: 1 },
        update: {},
        create: {
            userId: user.id,
            roomId: room1.id,
            startDate: new Date("2026-06-01"),
            endDate: new Date("2026-06-05"),
            totalPrice: 200.00,
            status: BookingStatus.CONFIRMED
        }
    });
    console.log("Booking created:", booking.id);

    console.log("Database seeding completed!");
}

main()
    .catch((e) => {
        console.error("Seeding error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });