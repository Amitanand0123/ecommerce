// src/app/verify-email/page.tsx
'use client';
import React, { useState, useEffect, ChangeEvent, KeyboardEvent, useRef, Suspense } from 'react'; // Import Suspense
import { useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Create a new component that uses useSearchParams
function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams(); // This hook causes the issue
  const email = searchParams.get('email') || '';
  const [code, setCode] = useState<string[]>(Array(8).fill(''));
  const [serverError, setServerError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const verifyMutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: () => {
      router.push('/login');
    },
    onError: (error) => {
      setServerError(error.message || "Verification failed. Please try again.");
    },
  });

  useEffect(() => {
    if (!email) {
      router.replace('/register'); 
    }
    if (email && inputRefs.current[0]) {
        inputRefs.current[0].focus();
    }
  }, [email, router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (/^[0-9]$/.test(value) || value === '') {
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        if (value && index < 7) {
          inputRefs.current[index + 1]?.focus();
        }
    } else if (value.length > 1 && /^[0-9]+$/.test(value)) {
        const newCode = [...code];
        const pastedDigits = value.split('');
        for (let i = 0; i < pastedDigits.length && (index + i) < 8; i++) {
            newCode[index + i] = pastedDigits[i];
            if ((index + i) < 7 && inputRefs.current[index + i + 1]) {
                inputRefs.current[index + i + 1]?.focus();
            } else if ((index + i) === 7) {
                inputRefs.current[index + i]?.focus();
            }
        }
        setCode(newCode);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index-1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 7) {
      inputRefs.current[index+1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const verificationCode = code.join('');
    if (verificationCode.length === 8 && email) {
      verifyMutation.mutate({ email, code: verificationCode });
    } else {
      setServerError("Please enter the complete 8-digit code.");
    }
  };
  
  const maskedEmail = email ? `${email.substring(0,3)}***@${email.split('@')[1]}` : 'your email address';

  if (!email && typeof window !== 'undefined') { // Added a check for window for client-side only redirect logic
    // This effect already handles redirect if email is not present,
    // but an early return with a loader might be good if email is truly essential for rendering anything.
    // For now, the useEffect handles it. A simple loading state could be returned here too.
    return <div className="flex justify-center items-center min-h-screen"><p>Loading...</p></div>;
  }


  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold mt-4">Verify your email</CardTitle>
        <CardDescription className='text-black mt-4'>
          <div>
            Enter the 8 digit code you have received on 
          </div>
          <span className="font-semibold">{maskedEmail}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {serverError && <p className="text-red-500 text-sm text-center">{serverError}</p>}
          <div>
            <div className='text-sm ml-2.5 mb-1'>
              Code
            </div>
            <div className="flex justify-center space-x-1.5">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  type="text"
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  ref={(el: HTMLInputElement | null) => {
                      inputRefs.current[index] = el;
                  }}
                  className="w-10 h-12 text-center text-xl border-gray-300 rounded"
                  aria-label={`Digit ${index + 1} of verification code`}
                />
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full h-12 bg-black mt-8 mb-4" disabled={verifyMutation.isPending}>
            {verifyMutation.isPending ? 'Verifying...' : 'VERIFY'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// This is your main page component
export default function VerifyEmailPage() {
  return (
    <div className="flex justify-center items-start min-h-screen pt-10"> {/* Added pt-10 for consistency */}
      <Suspense fallback={<div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><p>Loading page...</p></div>}>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}