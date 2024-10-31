import {PrismaAdapter} from '@auth/prisma-adapter';
import {createTransport} from 'nodemailer';
import {createHash} from 'crypto';
import NextAuth from 'next-auth';
import type {Provider} from 'next-auth/providers';
import Nodemailer from 'next-auth/providers/nodemailer';

import {prisma} from '@/lib/prisma';

const providers: Provider[] = [
  Nodemailer({
    async sendVerificationRequest(params) {
      const {identifier, url, provider, theme, request} = params;
      const {email, code} = await request.json();
      const user = await prisma.user.findUnique({
        where: {email},
      });
      if (!user) {
        if (!code) {
          throw new Error('New Users need a magic code');
        }
        const label = await prisma.batchSoapLabel.findUnique({
          where: {magicCode: code},
        });
        if (!label) {
          throw new Error('Invalid magic code');
        }
      }
      const {host} = new URL(url);
      const transport = createTransport(provider.server);
      const result = await transport.sendMail({
        to: identifier,
        from: provider.from,
        subject: `Sign in to ${host}`,
        text: text({url, host}),
        html: html({url, host, theme}),
      });
      const rejected = result.rejected || [];
      const pending = result.pending || [];
      const failed = rejected.concat(pending).filter(Boolean);
      if (failed.length) {
        throw new Error(`Email (${failed.join(', ')}) could not be sent`);
      }
    },
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
];

function html(params) {
  const {url, host, theme} = params;
  const escapedHost = host.replace(/\./g, '&#8203;.');
  const brandColor = theme.brandColor || '#346df1';
  const buttonText = theme.buttonText || '#fff';
  const color = {
    background: '#f9f9f9',
    text: '#444',
    mainBackground: '#fff',
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText,
  };
  return `
<body style="background: ${color.background};">
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Sign in to <strong>${escapedHost}</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                target="_blank"
                style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign
                in</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
`;
}

function text({url, host}) {
  return `Sign in to ${host}\n${url}\n\n`;
}

export const providerMap = providers.map(provider => {
  return {
    id: provider.id,
    name: provider.name,
  };
});

export const {handlers, signIn, signOut, auth} = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: providers,
  pages: {
    signIn: '/signin',
    signOut: '/signout',
    signUp: '/signup',
  },
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
