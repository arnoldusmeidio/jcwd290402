import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface Props {
   img: string;
   propertyName: string;
   location: string;
}

export default function MediumCard({ img, propertyName, location }: Props) {
   return (
      <div className="transform cursor-pointer gap-4 transition duration-300 ease-out hover:scale-105">
         <div className="h-auto max-h-96 w-auto max-w-96 sm:max-h-80 sm:max-w-80">
            <AspectRatio ratio={1 / 1}>
               <Image
                  className="rounded-lg object-cover"
                  src={img}
                  alt={propertyName}
                  loading="lazy"
                  fill
                  sizes="max-width: 348px"
               />
            </AspectRatio>
         </div>
         <div className="flex flex-col gap-2">
            <h3 className="mt-3 text-lg font-semibold">{propertyName}</h3>
            <h3 className="text-muted-foreground text-base">{location}</h3>
         </div>
      </div>
   );
}
