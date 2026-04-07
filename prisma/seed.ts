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
    const room1 = await prisma.room.create({
        data: {
            name: "Abatantuono",
            description: "Camera elegante ispirata al grande Diego Abatantuono. Arredata con gusto e dotata di tutti i comfort moderni.",
            price: 50.00,
            imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
            capacity: 2,
            isAvailable: true,
            images: {
                create: [
                    {
                        url: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
                        order: 0,
                        isPrimary: true,
                        caption: "Vista generale della camera"
                    },
                    {
                        url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
                        order: 1,
                        isPrimary: false,
                        caption: "Letto matrimoniale king size"
                    },
                    {
                        url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
                        order: 2,
                        isPrimary: false,
                        caption: "Bagno privato con doccia"
                    },
                    {
                        url: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
                        order: 3,
                        isPrimary: false,
                        caption: "Vista dalla finestra"
                    }
                ]
            }
        }
    });

    const room2 = await prisma.room.create({
        data: {
            name: "Verdone",
            description: "Camera dedicata al mitico Carlo Verdone. Spaziosa e confortevole con vista panoramica.",
            price: 60.00,
            imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
            capacity: 2,
            isAvailable: true,
            images: {
                create: [
                    {
                        url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
                        order: 0,
                        isPrimary: true,
                        caption: "Camera vista panoramica"
                    },
                    {
                        url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
                        order: 1,
                        isPrimary: false,
                        caption: "Zona relax con poltrone"
                    },
                    {
                        url: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800",
                        order: 2,
                        isPrimary: false,
                        caption: "Bagno in marmo"
                    },
                    {
                        url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800",
                        order: 3,
                        isPrimary: false,
                        caption: "Scrivania e area lavoro"
                    }
                ]
            }
        }
    });
    console.log("Rooms with images created:", room1.name, room2.name);

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