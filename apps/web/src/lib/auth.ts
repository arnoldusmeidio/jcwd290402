import { jwtVerify } from "jose";

export const getJwtSecretKey = () => {
   const secret = process.env.JWT_SECRET_KEY;

   if (!secret || secret.length === 0) {
      throw new Error("The environment variable JWT_SECRET_KEY is not set.");
   }

   return secret;
};

export async function verifyToken(token: string) {
   try {
      const verified = await jwtVerify(token, new TextEncoder().encode(getJwtSecretKey()));
      return verified.payload;
   } catch (error) {
      throw new Error("Your token is expired");
   }
}
