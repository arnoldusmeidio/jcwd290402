import { NextFunction, Request, Response } from "express";
import prisma from "@/prisma";
import { RequestWithUserId } from "@/types";
import crypto from "crypto";

export async function getBookings(req: RequestWithUserId, res: Response, next: NextFunction) {
   try {
      const id = (req as RequestWithUserId).user?.id;
      const user = await prisma.user.findUnique({
         where: { id, customer: { id } },
      });

      if (!user) return res.status(400).json({ message: "Failed to aunthenticate user", ok: false });

      const bookings = await prisma.booking.findMany({
         where: { customerId: user.id },
         include: { room: true },
      });

      if (!bookings) {
         return res.status(200).json({ data: bookings, message: "No bookings found", ok: true });
      }

      return res.status(200).json({ data: bookings, ok: true });
   } catch (error) {
      next(error);
   }
}

export async function getBookingsByBookingNumber(req: Request, res: Response, next: NextFunction) {
   try {
      const id = (req as RequestWithUserId).user?.id;
      const user = await prisma.user.findUnique({
         where: { id, customer: { id } },
      });

      if (!user) return res.status(400).json({ message: "Failed to aunthenticate user", ok: false });

      const { bookingNumber } = req.params;

      const booking = await prisma.booking.findUnique({
         where: { bookingNumber, customerId: user.id },
         include: { room: true },
      });

      if (!booking) {
         return res.status(404).json({ message: "No bookings found", ok: false });
      }

      return res.status(200).json({ data: booking, ok: true });
   } catch (error) {
      next(error);
   }
}

export async function deleteBookingByBookingNumber(req: Request, res: Response, next: NextFunction) {
   try {
      const id = (req as RequestWithUserId).user?.id;
      const user = await prisma.user.findUnique({
         where: { id, customer: { id } },
      });

      if (!user) return res.status(400).json({ message: "Failed to aunthenticate user", ok: false });

      const { bookingNumber } = req.params;

      const booking = await prisma.booking.findUnique({
         where: { bookingNumber, customerId: user.id, paymentStatus: "PENDING" },
      });

      if (!booking) {
         return res.status(404).json({ message: "No bookings found", ok: false });
      }

      await prisma.booking.delete({
         where: { bookingNumber, customerId: user.id, paymentStatus: "PENDING" },
      });

      return res.status(200).json({ message: "Booking cancelled", ok: true });
   } catch (error) {
      next(error);
   }
}

export async function createBooking(req: Request, res: Response, next: NextFunction) {
   try {
      const id = (req as RequestWithUserId).user?.id;
      const user = await prisma.user.findUnique({
         where: { id, customer: { id } },
      });

      //console.log(user!.id);

      if (!user) return res.status(400).json({ message: "Failed to get user", ok: false });

      const { roomId } = req.params;

      const validRoom = await prisma.room.findUnique({
         where: { id: roomId },
      });

      if (!validRoom) {
         return res.status(404).json({
            message: "Room not found",
            ok: false,
         });
      }

      const { date } = req.body;
      const bookingNumber = crypto.randomBytes(3).toString("hex").toUpperCase();

      //if (endDate < startDate) return res.status(400).json({ message: "Invalid Datetime", ok: false });
      if (!date) return res.status(400).json({ message: "Invalid Datetime", ok: false });

      const startDate = new Date(date.from.slice(0, 10).concat("T17:00:00.000Z"));
      const endDate = new Date(
         date.to ? date.to.slice(0, 10).concat("T17:00:00.000Z") : date.from.slice(0, 10).concat("T17:00:00.000Z"),
      );

      const newBooking = { startDate, endDate };

      const existingBookings = await prisma.booking.findMany({
         where: {
            roomId: validRoom!.id,
            AND: [
               {
                  startDate: {
                     lt: new Date(endDate), // Existing booking starts before new booking ends
                  },
               },
               {
                  endDate: {
                     gt: new Date(startDate), // Existing booking ends after new booking starts
                  },
               },
            ],
         },
      });

      const isDateRangeAvailable = (
         existingBookings: { startDate: Date; endDate: Date }[],
         newBooking: { startDate: Date; endDate: Date },
      ) => {
         const newStart = newBooking.startDate;
         const newEnd = newBooking.endDate;

         for (const booking of existingBookings) {
            const existingStart = booking.startDate;
            const existingEnd = booking.endDate;

            // Check for overlap
            if (!(newEnd < existingStart || newStart > existingEnd)) {
               return false; // Overlap exists
            }
         }
         return true; // No overlap
      };

      if (isDateRangeAvailable(existingBookings, newBooking)) {
         const createBooking = await prisma.booking.create({
            data: {
               startDate,
               endDate,
               bookingNumber,
               roomId,
               customerId: user.id,
               paymentStatus: "PENDING",
            },
         });

         if (!createBooking) return res.status(400).json({ message: "Error while creating booking", ok: false });

         return res.status(201).json({ data: createBooking, ok: true });
      } else {
         return res.status(400).json({ message: "Failed to create booking", ok: false });
      }
   } catch (error) {
      next(error);
   }
}
