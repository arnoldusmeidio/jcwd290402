"use client";

import SearchNavbar from "@/components/header/SearchNavbar";
import SearchSkeleton from "@/components/SearchSkeleton";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { currency } from "@/lib/currency";
import { useUserStore } from "@/stores/useUserStore";
import { Property } from "@/types/property-types";

type Props = {
   searchParams: SearchParams;
};

type SearchParams = {
   location: string;
   group_adults: string;
   group_children: string;
   no_rooms: string;
   checkin: string;
   checkout: string;
};

export default function SearchPage({ searchParams }: Props) {
   const [properties, setProperties] = useState<Property[]>([]);
   const [totalPropertiesFound, setTotalPropertiesFound] = useState(0);
   const [isLoading, setIsLoading] = useState(true);
   const [currencyLoading, setCurrencyLoading] = useState(true);
   const [currencyRates, setCurrencyRates] = useState<number | null>(null);
   const { user } = useUserStore();

   function getRatingDescription(rating: number) {
      if (rating < 1 || rating > 10) {
         return "Invalid rating";
      }
      if (rating >= 1 && rating <= 2) {
         return "Very Bad";
      } else if (rating >= 3 && rating <= 4) {
         return "Poor";
      } else if (rating > 4 && rating <= 6) {
         return "Average";
      } else if (rating > 6 && rating <= 8) {
         return "Good";
      } else if (rating > 8 && rating <= 9) {
         return "Excellent";
      } else if (rating > 9 && rating <= 10) {
         return "Exceptional";
      }
   }

   useEffect(() => {
      async function getCurrencyRates() {
         try {
            if (user?.currency == "USD") {
               const response = await fetch(
                  "https://api.freecurrencyapi.com/v1/latest?currencies=USD&base_currency=IDR",
                  {
                     headers: {
                        apikey: process.env.NEXT_PUBLIC_FREE_CURRENCY_KEY as string,
                     },
                  },
               );
               const data = await response.json();
               if (data.data) {
                  setCurrencyRates(data.data.USD);
               } else {
                  setCurrencyRates(1);
               }
            } else {
               setCurrencyRates(1);
            }
         } catch (error) {
            console.error(error);
         } finally {
            setCurrencyLoading(false); // FINISH LOADING CURRENCY RATE
         }
      }

      async function getProperties() {
         try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/property/search`, {
               credentials: "include",
            });
            const data = await response.json();
            console.log(data);
            if (data.ok) {
               setProperties(data.data);
               setTotalPropertiesFound(data.meta.totalProperties);
            }
         } catch (error) {
            console.error(error);
         } finally {
            setIsLoading(false);
         }
      }

      async function fetchData() {
         await getCurrencyRates();
         await getProperties();
      }

      fetchData();
   }, [user]);

   return (
      <>
         <SearchNavbar />
         {isLoading || currencyLoading || currencyRates === null ? (
            <SearchSkeleton />
         ) : (
            <main>
               <div className="mx-auto max-w-7xl p-6 lg:px-8">
                  <h2 className="pb-3 text-3xl font-bold">Your Search Results</h2>

                  <h3 className="pb-3">
                     Dates of trips
                     <span className="ml-2 italic">
                        {searchParams.checkin} to {searchParams.checkout}
                     </span>
                  </h3>

                  <hr className="mb-5" />

                  <h3 className="text-xl font-semibold">
                     {searchParams.location}: {totalPropertiesFound} properties found
                  </h3>

                  <div className="mt-5 space-y-2">
                     {properties.map((item, idx: number) => (
                        <div key={idx} className="flex justify-between space-x-4 space-y-2 rounded-lg border p-5">
                           <div className="h-auto w-64 max-sm:basis-1/2">
                              <Link href={"/"}>
                                 <AspectRatio ratio={1 / 1}>
                                    <Image
                                       className="rounded-lg object-cover"
                                       src={item.propertyPictures[0].url}
                                       alt="image of property"
                                       loading="lazy"
                                       fill
                                       sizes="max-width: 256px"
                                    />
                                 </AspectRatio>
                              </Link>
                           </div>

                           <div className="flex flex-1 flex-col justify-around gap-2 max-sm:basis-1/2 sm:flex-row sm:justify-between sm:space-x-5">
                              <div>
                                 <Link
                                    href={"/"}
                                    className="text-base font-bold text-[#1a61ef] hover:underline md:text-xl lg:text-2xl"
                                 >
                                    {item.name}
                                 </Link>
                                 <p className="hidden text-xs sm:flex lg:text-base">{item.description}</p>
                              </div>

                              <div className="flex flex-col justify-between gap-2">
                                 <div className="flex items-center gap-2 sm:items-start sm:justify-end sm:space-x-2 sm:text-right">
                                    <div className="items-start gap-2 max-sm:order-2 max-sm:items-center sm:flex sm:flex-col sm:items-end">
                                       <p className="text-xs sm:font-bold md:text-sm lg:text-base">
                                          {item.reviews.length > 0
                                             ? getRatingDescription(
                                                  item.reviews.reduce((acc: number, review) => {
                                                     return acc + review.star;
                                                  }, 0) / item.reviews.length,
                                               )
                                             : null}
                                       </p>
                                       <p className="text-xs sm:flex md:text-sm lg:text-base">
                                          {item.reviews.length > 0 && `${item.reviews.length} reviews`}
                                       </p>
                                    </div>

                                    <p className="text-background flex-shink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a61ef] text-sm font-bold max-sm:order-1 lg:h-12 lg:w-12 lg:text-lg">
                                       {item.reviews.length > 0
                                          ? (
                                               item.reviews.reduce((acc: number, review) => {
                                                  return acc + review.star;
                                               }, 0) / item.reviews.length
                                            ).toFixed(1)
                                          : "N/A"}
                                    </p>
                                 </div>

                                 <div className="sm:text-right">
                                    <p className="text-xs md:text-sm lg:text-base">
                                       capacity: {item.room[0].roomCapacity} persons
                                    </p>
                                    <p className="text-lg font-bold md:text-xl lg:text-2xl">
                                       {currencyRates == 1
                                          ? currency(item.room[0].roomPrice[0].price, "IDR", currencyRates)
                                          : currency(item.room[0].roomPrice[0].price, user?.currency, currencyRates)}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </main>
         )}
      </>
   );
}