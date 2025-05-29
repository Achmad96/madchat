import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import type { UserType } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { fetchData } from "@/services/FetchService";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bufferArrayToBase64 } from "@/lib/utils";

const ProfileFormSchema = z.object({
  display_name: z.string().min(1, { message: "Name is required" }),
  avatar: z
    .instanceof(File, { message: "Image is required" })
    .optional()
    .refine((file) => !file || file.size === 0 || file.size <= 5000000, { message: "Max size exceeded" })
});

const PasswordFormSchema = z.object({
  current: z.string().min(1, { message: "Current password is required" }),
  new: z
    .string()
    .min(1, { message: "New password is required" })
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
      message: "Password must contain at least one letter and one number."
    })
    .refine((val) => val !== "current", {
      message: "New password must be different from current password."
    })
});

type ProfileFormData = z.infer<typeof ProfileFormSchema>;
type PasswordFormData = z.infer<typeof PasswordFormSchema>;

export function ProfileSettingsPage() {
  const { user } = useAuth() as { user: UserType | null };
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [avatar, setAvatar] = useState<string>("");
  const reader = new FileReader();

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      display_name: "",
      avatar: undefined
    }
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(PasswordFormSchema),
    defaultValues: {
      current: "",
      new: ""
    }
  });

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        reader.onloadend = () => {
          setAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);
        profileForm.setValue("avatar", file);
      }
    },
    [profileForm, reader]
  );

  useEffect(() => {
    if (user?.avatar && user.avatar.data) {
      try {
        const base64String = bufferArrayToBase64(user.avatar.data);
        setAvatar(`data:image/jpeg;base64,${base64String}`);
      } catch (error) {
        console.error("Error converting avatar to base64:", error);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      profileForm.setValue("display_name", user.display_name || "");
    }
  }, [user, profileForm]);

  const onProfileSubmit = useCallback(
    async (data: ProfileFormData) => {
      try {
        setIsLoading(true);
        const formData = new FormData();
        formData.append("display_name", data.display_name);
        if (data.avatar && data.avatar.size > 0) {
          formData.append("avatar", data.avatar);
        }
        const response = await fetchData("users/profile", {
          method: "PUT",
          body: formData
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update profile");
        }
        toast.success("Update successful");
      } catch (error) {
        console.error("Error:", error);
        toast.error("Update failed: " + (error instanceof Error ? error.message : "Please try again."));
      } finally {
        setIsLoading(false);
      }
    },
    [profileForm]
  );

  const onPasswordSubmit = useCallback(async (data: PasswordFormData) => {
    try {
      setIsLoading(true);
      await fetchData("users/change-password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword: data.current, newPassword: data.new }),
        headers: { "Content-Type": "application/json" }
      });
      toast.success("Password changed successfully. You will be logged out.");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Password change failed: " + (error instanceof Error ? error.message : "Please try again."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <section className="flex h-[90dvh] w-full items-center justify-center">
      <Tabs defaultValue="account" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Make changes to your account here. Click save when you're done.</CardDescription>
            </CardHeader>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <CardContent className="space-y-2">
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <Label htmlFor="avatar">Avatar</Label>
                    <div className="relative space-x-2">
                      <Avatar className="w-28 h-28">
                        <AvatarImage src={avatar} alt={user?.username} className="object-cover" />
                        <AvatarFallback>{user?.username ? user.username[0].toUpperCase() : "?"}</AvatarFallback>
                        <input id="avatar" type="file" accept="image/*" onChange={handleChange} className="rounded-full opacity-0 w-full h-full border top-0 left-0 absolute cursor-pointer" />
                      </Avatar>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue={user?.username ? `@${user.username}` : ""} disabled />
                  </div>
                  <FormField
                    control={profileForm.control}
                    name="display_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your name" autoComplete="name" disabled={isLoading} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save changes"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password here. After saving, you'll be logged out.</CardDescription>
            </CardHeader>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <CardContent className="space-y-2">
                  <FormField
                    control={passwordForm.control}
                    name="current"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your current password" autoComplete="current-password" disabled={isLoading} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="new"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your new password" autoComplete="new-password" disabled={isLoading} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit">{isLoading ? "Saving..." : "Save password"}</Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
