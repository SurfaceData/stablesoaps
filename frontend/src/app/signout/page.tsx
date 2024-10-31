import {signOut} from '@/lib/auth';

import {Button} from '@/components/ui/button';

export default function SignOutPage() {
  return (
    <div className="flex flex-col h-screen w-full items-center justify-center px-4">
      <h5>Are you sure you want to sign out?</h5>
      <form
        action={async formData => {
          'use server';
          await signOut({redirectTo: '/'});
        }}>
        <Button type="submit">Sign out</Button>
      </form>
    </div>
  );
}
