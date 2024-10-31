import Link from 'next/link';
import {redirect} from 'next/navigation';
import {AuthError} from 'next-auth';

import {signIn} from '@/lib/auth';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';

export function LoginForm(props: {
  searchParams: {callbackUrl: string | undefined};
}) {
  const handleSubmit = async formData => {
    'use server';
    try {
      await signIn('nodemailer', {
        redirectTo: '/',
        email: formData.get('email'),
      });
    } catch (error) {
      if (error instanceof AuthError) {
        return redirect(`/?error=${error.type}`);
      }
      throw error;
    }
  };
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input name="email" id="email" type="email" required />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </div>
        </form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
