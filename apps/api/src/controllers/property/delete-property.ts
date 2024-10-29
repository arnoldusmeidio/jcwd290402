import { NextFunction, Request, Response } from "express";
import prisma from "@/prisma";
import cloudinary from "@/config/cloudinary";
import { RequestWithUserId } from "@/types"; // Assuming user type in your request

// Delete Property
export const deleteProperty = async (req: RequestWithUserId, res: Response, next: NextFunction) => {
   try {
      const id = req.user?.id; // Get user ID from request
      const propertyId = req.params.id; // Get propertyId from URL parameters

      // Fetch the property and include the tenant and picture URLs
      const property = await prisma.property.findUnique({
         where: { id: propertyId },
         include: { tenant: true, propertyPictures: true }, // Include picture URLs
      });

      // Check if the property exists and if it belongs to the tenant
      if (!property || !property.tenant) {
         return res.status(404).json({ message: "Property or Tenant not found" });
      }

      const tenantId = property.tenant.id;

      if (id !== tenantId) {
         return res.status(403).json({ message: "Unauthorized to delete this property" });
      }

      // Loop through each picture URL and delete from Cloudinary
      for (const pic of property.propertyPictures) {
         const publicId = pic.url.split("/").pop()?.split(".")[0]; // Assuming 'name' holds the URL or path
         if (publicId) {
            await cloudinary.uploader.destroy(`images/${publicId}`);
         }
      }

      // Delete the property from the database
      await prisma.property.delete({
         where: { id: propertyId },
      });

      return res.status(200).json({ message: "Property successfully deleted", ok: true });
   } catch (error) {
      console.error(error);
      next(error);
   }
};
