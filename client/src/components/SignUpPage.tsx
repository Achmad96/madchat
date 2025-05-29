import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';
import { useState } from 'react';
import { API_URL } from '@/configs/API';
import { useNavigate } from 'react-router';

const FormSchema = z.object({
  username: z
    .string()
    .min(5, {
      message: 'Username must be at least 5 characters.'
    })
    .max(20, {
      message: 'Username cannot exceed 20 characters.'
    }),
  display_name: z
    .string()
    .max(30, {
      message: 'Display name cannot exceed 30 characters.'
    })
    .optional(),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.'
  }),
  avatar: z.instanceof(File).optional()
});

type FormData = z.infer<typeof FormSchema>;

export default function SignUpPage() {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: '',
      display_name: '',
      password: ''
    }
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('avatar', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: FormData) {
    try {
      const formData = new FormData();
      formData.append('username', data.username);
      formData.append('password', data.password);

      if (data.display_name) {
        formData.append('display_name', data.display_name);
      }

      if (data.avatar) {
        formData.append('avatar', data.avatar);
      }

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error('Error creating account', {
          description: errorData.message || 'An error occurred while creating your account.',
          duration: 3000
        });
        return;
      }

      toast.success('Account created successfully!');
      navigate('/sign-in', { replace: true });
    } catch (error) {
      toast.error('Error creating account', {
        description: 'An error occurred while creating your account.',
        duration: 3000
      });
    }
  }

  return (
    <main className="w-full h-auto min-h-dvh justify-center items-center flex flex-col">
      <Card className="w-[30%] max-md:w-full">
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl font-bold">SIGN UP</h2>
          </CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" encType="multipart/form-data">
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
                    </FormControl>
                    <FormDescription>Required. This is your unique identifier (5-20 characters).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="display_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your display name" {...field} />
                    </FormControl>
                    <FormDescription>Optional. This is the name shown to other users.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avatar"
                render={() => (
                  <FormItem>
                    <FormLabel>Profile Picture</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Input type="file" accept="image/*" onChange={handleAvatarChange} className="cursor-pointer" />
                        {avatarPreview && (
                          <div className="mt-2">
                            <img src={avatarPreview} alt="Avatar preview" className="w-20 h-20 object-cover rounded-full border" />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>Optional. Upload a profile picture.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-2 text-sm text-center">
                <span>Already have an account? </span>
                <a href="/sign-in" className="text-blue-600 hover:underline">
                  Sign in
                </a>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit">Sign up</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </main>
  );
}
