"use client";

import { useRouter } from "@/i18n/routing";

interface LoginButtonProps {
   children: React.ReactNode;
   mode?: "modal" | "redirect";
   asChild?: boolean;
}

export default function ProfileButton({ children, mode = "redirect", asChild }: LoginButtonProps) {
   const router = useRouter();

   const onClick = () => {
      router.push("/user/profile");
   };

   if (mode === "modal") {
      return <span>TODO: Implement modal!</span>;
   }

   return (
      <span onClick={onClick} className="cursor-pointer">
         {children}
      </span>
   );
}
