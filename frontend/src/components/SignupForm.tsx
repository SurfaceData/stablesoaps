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

export function SignupForm(props: {
  searchParams: {callbackUrl: string | undefined};
}) {
  const handleSubmit = async formData => {
    'use server';
    try {
      await signIn('nodemailer', {
        redirectTo: '/',
        email: formData.get('email'),
        code: formData.get('code'),
      });
    } catch (error) {
      if (error instanceof AuthError) {
        //return redirect(`/?error=${error.type}`);
      }
      throw error;
    }
  };
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Signup</CardTitle>
        <CardDescription>
          Get your soap's Magic Code and sign up!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                name="email"
                id="email"
                type="email"
                required
                placeholder="your@email.com"
              />
              <Label htmlFor="code">Magic Code</Label>
              <Input
                name="code"
                id="code"
                type="text"
                placeholder="Soap Code Here..."
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
