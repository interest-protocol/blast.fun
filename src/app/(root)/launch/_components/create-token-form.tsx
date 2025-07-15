"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TokenCreationButton from "./create-token-button";

const tokenSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(20, "Name must be less than 20 characters"),
  symbol: z.string().min(2, "Symbol must be at least 2 characters").max(10, "Symbol must be less than 10 characters").regex(/^[a-zA-Z][\x21-\x7E]*$/).transform(s => s.toUpperCase()),
  description: z.string().min(10, "Description must be at least 10 characters").max(256, "Description must be less than 256 characters"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  telegram: z.string().url("Must be a valid Telegram URL").optional().or(z.literal("")),
  twitter: z.string().url("Must be a valid Twitter/X URL").optional().or(z.literal("")),
});

export type TokenFormValues = z.infer<typeof tokenSchema>;

export default function CreateTokenForm() {
  const form = useForm<TokenFormValues>({
    resolver: zodResolver(tokenSchema),
    defaultValues: {
      name: "",
      symbol: "",
      description: "",
      imageUrl: "",
      website: "",
      telegram: "",
      twitter: "",
    },
    mode: 'onBlur'
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Your Token</CardTitle>
        <CardDescription>
          Launch your token on Sui with automatic liquidity pool creation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Awesome Token" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name of your token (3-20 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token Symbol</FormLabel>
                    <FormControl>
                      <Input placeholder="MAT" {...field} />
                    </FormControl>
                    <FormDescription>
                      The ticker symbol (2-10 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your token project..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of your token (10-256 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token Image URL</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input placeholder="https://sui.com/images/logo.png" {...field} />
                      <Button type="button" variant="outline" size="icon" disabled>
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    URL to your token's logo image
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://mytoken.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telegram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telegram</FormLabel>
                    <FormControl>
                      <Input placeholder="https://t.me/mytoken" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter/X</FormLabel>
                    <FormControl>
                      <Input placeholder="https://x.com/mytoken" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <TokenCreationButton form={form} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}