import { RoomStatus } from "@/types/room-status";

export function checkRoomBooking(date: Date, roomStatus: RoomStatus | undefined): boolean {
   const booking = roomStatus?.booking;
   const targetTime = date.getTime();
   const now = Date.now();
   const ninetyDaysFromNow = now + 90 * 24 * 60 * 60 * 1000;

   if (targetTime < now || targetTime > ninetyDaysFromNow) {
      return true;
   }

   if (booking) {
      for (const { startDate, endDate } of booking) {
         const startTime = new Date(startDate).getTime();
         const endTime = new Date(endDate).getTime();

         if (targetTime >= startTime && targetTime <= endTime) {
            return true;
         }
      }
   }

   return false;
}
