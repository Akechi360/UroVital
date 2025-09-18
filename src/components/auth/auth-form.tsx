'use client';

import { useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Stethoscope, LogIn } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { login } from '@/lib/actions';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
});

type AuthMode = 'login' | 'register' | 'forgot-password';

interface AuthFormProps {
  mode: AuthMode;
}

const formSchemas = {
  login: loginSchema,
  register: registerSchema,
  'forgot-password': forgotPasswordSchema,
};

export default function AuthForm({ mode: initialMode }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchemas[mode]),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema | typeof registerSchema | typeof forgotPasswordSchema>) => {
    if (mode === 'login') {
        const result = await login(values as z.infer<typeof loginSchema>);
        if (result.success) {
            toast({ title: "Login successful", description: "Redirecting to dashboard..." });
            window.location.assign('/dashboard');
        } else {
            toast({ variant: "destructive", title: "Login Failed", description: result.error });
        }
    } else {
      toast({ title: `Mock ${mode} successful!`, description: `Data: ${JSON.stringify(values)}` });
      if (mode === 'register') setMode('login');
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome Back';
      case 'register': return 'Create Account';
      case 'forgot-password': return 'Reset Password';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'login': return 'Sign in to access your dashboard.';
      case 'register': return 'Join UroFlow today.';
      case 'forgot-password': return 'Enter your email to receive a reset link.';
    }
  };

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border/20 bg-card/50 shadow-2xl shadow-primary/10 backdrop-blur-lg">
      <div className="p-8">
        <div className="mb-6 text-center">
            <div className="mx-auto mb-4 inline-block rounded-full bg-primary/10 p-3">
                <Stethoscope className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground font-headline">{getTitle()}</h1>
            <p className="text-muted-foreground">{getDescription()}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div
                key={mode}
                className="space-y-4"
              >
                {mode === 'register' && (
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Dr. John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {(mode === 'login' || mode === 'register' || mode === 'forgot-password') && (
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="doctor@uroflow.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {(mode === 'login' || mode === 'register') && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                            <FormLabel>Password</FormLabel>
                            {mode === 'login' && (
                                <button type="button" onClick={() => setMode('forgot-password')} className="text-sm font-medium text-primary hover:underline">
                                    Forgot?
                                </button>
                            )}
                        </div>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Processing...' : getTitle()}
              <LogIn className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
        <div className="mt-6 text-center text-sm">
          {mode === 'login' && (
            <p className="text-muted-foreground">
              Don&apos;t have an account?{' '}
              <button onClick={() => {form.reset(); setMode('register')}} className="font-medium text-primary hover:underline">
                Register
              </button>
            </p>
          )}
          {mode === 'register' && (
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <button onClick={() => {form.reset(); setMode('login')}} className="font-medium text-primary hover:underline">
                Login
              </button>
            </p>
          )}
           {mode === 'forgot-password' && (
            <p className="text-muted-foreground">
              Remember your password?{' '}
              <button onClick={() => {form.reset(); setMode('login')}} className="font-medium text-primary hover:underline">
                Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
