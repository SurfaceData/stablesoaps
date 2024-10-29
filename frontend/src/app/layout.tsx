import type {Metadata} from 'next';
import {SessionProvider} from 'next-auth/react';
import localFont from 'next/font/local';

import {ApolloWrapper} from '@/app/ApolloWrapper';
import '@/app/globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <ApolloWrapper>{children}</ApolloWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}
