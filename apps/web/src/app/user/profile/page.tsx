"use client";

import ChangeEmailForm from "@/components/auth/ChangeEmailForm";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import UserCard from "@/components/user/UserCard";
import { useUserStore } from "@/stores/useUserStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
   const [isLoading, setIsLoading] = useState(true);
   const { setUser } = useUserStore();

   const router = useRouter();

   async function getUser() {
      try {
         const user = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/users`, {
            credentials: "include",
         });
         const data = await user.json();
         if (data.ok) {
            setUser(data.data);
            if (!data.data.tenant && !data.data.customer) {
               router.push("/select-role");
               router.refresh();
            }
         }
         setIsLoading(false);
      } catch (error) {
         console.error(error);
      }
   }

   useEffect(() => {
      getUser();
   }, []);

   return (
      <div className="w-[375px] content-center self-center">
         <div className="w-full py-4">
            {isLoading ? <Skeleton className="h-[750px] w-full" /> : <UserCard getUser={getUser} />}
         </div>
      </div>
   );
}
