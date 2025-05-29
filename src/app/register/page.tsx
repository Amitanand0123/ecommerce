// src/app/register/page.tsx
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
import { TRPCClientError } from '@trpc/client'; // Import TRPCClientError
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
    onError: (error) => { // error is TRPCClientErrorLike<AppRouter> by inference
      setServerError(error.message || "Registration failed. Please try again.");
      
      if (error.data?.code === 'CONFLICT') {
        // Accessing cause might require checking the specific error instance or its shape
        // For TRPCClientError, `cause` might be on the original error if it's wrapped.
        // Let's try to access it more robustly.
        // The `cause` we set on the server in TRPCError should be part of the `error.data` payload
        // if the default error formatter is used, or on `error.meta` if custom.
        // Based on TRPCError structure, `cause` should be on the error object itself if it's an instance of TRPCError from the server.
        // However, the client receives TRPCClientError.
        // Let's assume `error.data` might contain the `cause` if it's passed through the error formatter.

        // A common way `cause` is propagated is through the `data` part of the error shape
        // when you construct TRPCError({ code, message, cause }) on the server.
        // The `cause` you added on the backend TRPCError is usually available in `error.data.cause`
        // if it's not a standard JS Error `cause`.
        // Let's assume the server-side `cause` is packed into `error.data` by tRPC.
        // However, `error.data` on the client is `DefaultErrorData` which doesn't include `cause`.

        // The `cause` property on the `TRPCError` instance created on the server
        // should be accessible on the `TRPCClientError` instance on the client as `error.cause`.
        // The `TRPCClientErrorLike` type might be too generic. Let's check `error.cause`.
        
        const typedError = error as TRPCClientError<AppRouter>; // Cast to the more specific client error
        
        if (typedError.cause && typeof typedError.cause === 'object' && typedError.cause !== null) {
            const cause = typedError.cause as RegisterErrorCause; // Now assert its shape
            if (cause.email) {
              setTimeout(() => {
                router.push(`/verify-email?email=${encodeURIComponent(cause.email as string)}`);
              }, 2000);
            }
        } else {
            // Fallback or log if cause is not found as expected
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