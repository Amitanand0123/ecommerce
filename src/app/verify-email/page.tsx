'use client';
import { useState, useEffect, ChangeEvent, KeyboardEvent, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      router.push('/register');
    }
  }, [email, router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
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
  
  const maskedEmail = email ? `${email.substring(0,3)}***@${email.split('@')[1]}` : '';

  return (
    <div className="flex justify-center items-start min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold mt-4">Verify your email</CardTitle>
          <CardDescription className='text-black mt-4'>
            <div className=''>
              Enter the 8 digit code you have received on 
            </div>
            <span className="font-semibold">{maskedEmail}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {serverError && <p className="text-red-500 text-sm text-center">{serverError}</p>}
            <div>
              <div className='text-sm ml-2.5'>
                Code
              </div>
              <div className="flex justify-center space-x-2 mt-2">
                {code.map((digit, index) => (
                  <Input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className="w-10 h-12 text-center text-xl border-gray-300 rounded"
                    pattern="[0-9]"
                  />
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full h-12 bg-black mt-8 mb-4" disabled={verifyMutation.isLoading}>
              {verifyMutation.isLoading ? 'Verifying...' : 'VERIFY'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}