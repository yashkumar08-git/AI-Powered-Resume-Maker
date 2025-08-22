import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: 'Resume Maker',
  description: 'Create a professional resume and cover letter with AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Source+Code+Pro&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased flex flex-col',
          'bg-image'
        )}
      >
        <AuthProvider>
          <Header />
          <div className="relative flex-grow flex flex-col">
             <div className="absolute inset-0 bg-black/10 backdrop-blur-sm z-0" />
            <main className="flex-grow relative z-10 h-full">{children}</main>
          </div>
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
