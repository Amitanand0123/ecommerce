'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { TRPCClientError } from '@trpc/client';
import type { AppRouter } from '@/server/trpc';

const registerSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/, {
        message: "Password must have at least 1 uppercase letter, 1 digit, and 1 special character",
    }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterErrorCause {
    email?: string;
    isConflict?: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    },
    onError: (error) => { 
      setServerError(error.message || "Registration failed. Please try again.");
      
      if (error.data?.code === 'CONFLICT') {
        
        const typedError = error as TRPCClientError<AppRouter>;
        
        if (typedError.cause && typeof typedError.cause === 'object' && typedError.cause !== null) {
            const cause = typedError.cause as RegisterErrorCause;
            if (cause.email) {
              setTimeout(() => {
                router.push(`/verify-email?email=${encodeURIComponent(cause.email as string)}`);
              }, 2000);
            }
        } else {
            console.warn("CONFLICT error, but email cause not found directly on error.cause. Error data:", error.data);
        }
      }
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    setServerError(null);
    registerMutation.mutate(data);
  };

  return (
    <div className="flex justify-center items-start min-h-screen">
      <Card className="w-full max-w-md min-h-[550px]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && <p className="text-red-500 text-sm text-center">{serverError}</p>}
            <div className='space-y-3'>
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Enter" {...register('name')} className='h-12' />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div className='space-y-3'>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter" {...register('email')} className='h-12'  />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div className='space-y-3'>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter" {...register('password')} className='h-12'  />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full h-12 bg-black" disabled={registerMutation.isPending || isSubmitting}>
              {registerMutation.isPending || isSubmitting ? 'Creating Account...' : 'CREATE ACCOUNT'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm">
            Have an Account?{' '}
            <Link href="/login" className="font-semibold text-black hover:underline">
              LOGIN
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}