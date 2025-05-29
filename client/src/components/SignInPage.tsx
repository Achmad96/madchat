import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { API_URL } from '@/configs/API';

const FormSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' })
});

type FormData = z.infer<typeof FormSchema>;

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  });

  async function onSubmit(data: FormData) {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Login failed');
      }

      localStorage.setItem('token', responseData.token);

      toast.success('Login successful', {
        description: 'Welcome back!'
      });

      navigate('/');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Login failed', {
        description: error instanceof Error ? error.message : 'Please check your credentials and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="w-full h-auto min-h-dvh justify-center items-center flex flex-col">
      <Card className="w-[30%] max-md:w-full">
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl font-bold">SIGN IN</h2>
          </CardTitle>
          <CardDescription>Log in to your account here!</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" autoComplete="username" disabled={isLoading} {...field} />
                    </FormControl>
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
                      <Input type="password" placeholder="Enter your password" autoComplete="current-password" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="mt-2 text-sm text-center">
                <span>Don't have an account? </span>
                <a href="/sign-up" className="text-blue-600 hover:underline">
                  Sign up
                </a>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </main>
  );
}
