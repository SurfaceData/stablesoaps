import {PrismaAdapter} from '@auth/prisma-adapter';
import {createHash} from 'crypto';
import NextAuth from 'next-auth';
import Nodemailer from 'next-auth/providers/nodemailer';

import {prisma} from '@/lib/prisma';

export const {handlers, signIn, signOut, auth} = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Nodemailer({
      server: {
        host: process.env.MAILER_SMTP_HOST,
        port: process.env.MAILER_SMTP_PORT,
        secure: true,
        auth: {
          user: process.env.MAILER_SMTP_USERNAME,
          pass: process.env.MAILER_SMTP_PASSWORD,
        },
      },
      from: process.env.MAILER_FROM,
    }),
  ],
  callbacks: {
    async session({session, user}) {
      const profileHash = createHash('sha256')
        .update(user.email.trim().toLowerCase())
        .digest('hex');
      session.user.profileImageUrl = `https://gravatar.com/avatar/${profileHash}?s=200`;
      return session;
    },
  },
});
