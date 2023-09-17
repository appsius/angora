import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';

import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Angora',
  description: 'An app where lost people find each other!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <body className={`${inter.className} bg-dark-1`}>
          <div className='flex justify-center align-items w-full min-h-screen'>
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
