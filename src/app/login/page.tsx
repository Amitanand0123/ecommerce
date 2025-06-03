// src/app/(auth)/login/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { trpc } from '@/lib/trpc/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      if (data.user) {
        await login(data.user);
        router.push('/interests');
      }
    },
    onError: (error) => {
      setServerError(error.message || "Login failed. Please check your credentials.");
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setServerError(null);
    loginMutation.mutate(data);
  };

  return (
    <div className="flex justify-center items-start pt-2 min-h-screen">
      <Card className="w-full max-w-md min-h-[450px]">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Login</CardTitle>
          <CardDescription className="mt-6 text-xl text-black font-semibold">
            Welcome back to ECOMMERCE <br />
            <div className='text-[14px] font-medium mt-2'>
              The next gen business marketplace
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && <p className="text-red-500 text-sm text-center">{serverError}</p>}
            <div className='space-y-3'>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter" {...register('email')} className='h-12' />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div className="relative space-y-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter"
                {...register('password')}
                className='h-12'
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-sm font-semibold text-gray-600 hover:text-black"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full h-12 bg-black mt-6" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Logging In...' : 'LOGIN'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <hr className="w-full border-t border-gray-300" />
          <p className="text-sm mt-8 pb-4">
            Dont have an Account?{' '}
            <Link href="/register" className="font-semibold text-black hover:underline">
              SIGN UP
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}