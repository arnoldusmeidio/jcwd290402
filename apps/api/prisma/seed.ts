import prisma from "./client";
import { genSalt, hash } from "bcrypt";

async function inputData() {
   console.log("Start seeding...\n");
   const salt = await genSalt(10);
   const hashedPassword = await hash("password", salt);

   const budi = await prisma.user.create({
      data: {
         name: "Budi",
         email: "budi123@mail.com",
         password: hashedPassword,
         tenant: { create: {} },
         accountProvider: "CREDENTIALS",
      },
   });

   const joko = await prisma.user.create({
      data: {
         name: "Joko",
         email: "joko123@mail.com",
         password: hashedPassword,
         tenant: { create: {} },
         accountProvider: "CREDENTIALS",
      },
   });

   const alex = await prisma.user.create({
      data: {
         name: "Alex",
         email: "alex123@mail.com",
         password: hashedPassword,
         customer: { create: {} },
         accountProvider: "CREDENTIALS",
         wallet: { create: {} },
      },
   });

   const jeta = await prisma.user.create({
      data: {
         name: "Jessica Tanaka",
         email: "jeta123@mail.com",
         password: hashedPassword,
         customer: { create: {} },
         accountProvider: "CREDENTIALS",
         wallet: { create: {} },
      },
   });

   await prisma.property.create({
      data: {
         name: "Super Villa",
         address: "Bali",
         description: "Cozy place",
         pictureUrl:
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
         tenantId: budi.id,
         room: {
            createMany: {
               data: [
                  {
                     type: "Luxury",
                     description: "Luxury",
                     pictureUrl:
                        "https://images.unsplash.com/photo-1680503146476-abb8c752e1f4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                     price: 500000,
                     roomCapacity: 3,
                  },
                  {
                     type: "Standard",
                     description: "Standard",
                     pictureUrl:
                        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                     price: 300000,
                     roomCapacity: 2,
                  },
               ],
            },
         },
      },
   });

   await prisma.property.create({
      data: {
         name: "Villa Aja",
         address: "Bali",
         description: "Standard place",
         pictureUrl:
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
         tenantId: budi.id,
         room: {
            createMany: {
               data: [
                  {
                     type: "Luxury",
                     description: "Luxury",
                     pictureUrl:
                        "https://images.unsplash.com/photo-1680503146476-abb8c752e1f4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                     price: 500000,
                     roomCapacity: 3,
                  },
                  {
                     type: "Standard",
                     description: "Standard",
                     pictureUrl:
                        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                     price: 300000,
                     roomCapacity: 2,
                  },
               ],
            },
         },
      },
   });
   console.log("Seeding complete\n");
}

inputData()
   .catch((e) => {
      console.error(e);
      process.exit(1);
   })
   .finally(async () => {
      await prisma.$disconnect();
   });
