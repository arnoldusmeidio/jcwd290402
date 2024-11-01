"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "../ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormError from "../FormError";
import FormSuccess from "../FormSuccess";
import { toast } from "sonner";

type CardProps = React.ComponentProps<typeof Card>;

const uploadImageSchema = z.object({
   pictureUrl: z
      .instanceof(File)
      .refine(
         (files) => ["image/jpeg", "image/jpg", "image/png"].includes(files.type),
         "Only .jpg, .jpeg, and .png formats are supported",
      )
      .refine((file) => file?.size <= 1000000, `Max image size is 1MB.`),
});

export default function ManualTransferCard({ className, ...props }: CardProps) {
   const router = useRouter();

   //params
   const params = useParams();
   const bookingNumber = params.slug;

   const [error, setError] = useState<string | undefined>("");
   const [success, setSuccess] = useState<string | undefined>("");
   const [picture, setPicture] = useState<string | undefined>(undefined);

   //schema
   const form = useForm<z.infer<typeof uploadImageSchema>>({
      resolver: zodResolver(uploadImageSchema),
      defaultValues: {
         pictureUrl: new File([], ""),
      },
   });

   const {
      formState: { isSubmitting },
   } = form;

   //hardcode data
   const sampleBank = [
      {
         header: "Bank Name",
         description: "Bank Central Asia (BCA)",
      },
      {
         header: "Account Number",
         description: "BCA0123456789",
      },
      {
         header: "Account Name",
         description: "OASIS RESORT",
      },
      {
         header: "Amount",
         description: "-",
      },
   ];

   //on submit
   const onSubmit = async (values: z.infer<typeof uploadImageSchema>) => {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
         formData.append("pictureUrl", value);
      });

      try {
         const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/payments/transfer/${bookingNumber}`,
            {
               method: "POST",
               body: formData,
               credentials: "include",
            },
         );
         const data = await response.json();
         if (!data.ok) {
            setSuccess("");
            setError(data.message);
         } else {
            setError("");
            setSuccess(data.message);

            form.reset();
            toast(data.message, { duration: 1500 });
            router.push("../");
         }
      } catch (error) {
         console.error(error);
         setError("error");
      }
   };

   return (
      <Card className={cn("w-[380px]", className)} {...props}>
         <CardHeader>
            <CardTitle>Transfer Bank</CardTitle>
            <CardDescription></CardDescription>
         </CardHeader>
         <CardContent className="grid gap-4">
            <div className="flex items-center space-x-4 rounded-md border p-4">
               <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Manual Transfer</p>
                  <p className="text-muted-foreground text-sm">Please upload your payment proof</p>
               </div>
            </div>
            <div>
               {sampleBank.map((bank, index) => (
                  <div key={index} className="grid-cols mb-4 grid items-start pb-4 last:mb-0 last:pb-0">
                     <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">• {bank.header}</p>
                        <p className="text-muted-foreground text-sm">{bank.description}</p>
                     </div>
                  </div>
               ))}
            </div>

            <Form {...form}>
               <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="space-y-4">
                     <FormField
                        control={form.control}
                        name="pictureUrl"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Upload Payment Proof</FormLabel>
                              <FormControl>
                                 <Input
                                    disabled={isSubmitting}
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => {
                                       field.onChange(event.target?.files?.[0] ?? undefined);
                                       setPicture(
                                          event.target?.files?.[0]
                                             ? URL.createObjectURL(event.target?.files?.[0])
                                             : undefined,
                                       );
                                    }}
                                 />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                  </div>
                  <FormError message={error} />
                  <FormSuccess message={success} />
                  <Button className="w-full" type="submit" disabled={isSubmitting}>
                     Upload Payment Proof
                  </Button>
               </form>
            </Form>
         </CardContent>
         <CardFooter></CardFooter>
      </Card>
   );
}