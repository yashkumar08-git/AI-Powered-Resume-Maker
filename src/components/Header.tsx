
"use client";

import { Wand2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, LogOut, LogIn, UserPlus } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export function Header() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };
  
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 border-b animate-fade-in-down sticky top-0 z-40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary/10 group-hover:bg-primary/20 rounded-full transition-all duration-300 transform group-hover:scale-110">
            <Wand2 className="h-6 w-6 text-primary transition-transform duration-300 group-hover:rotate-12" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">Resume Maker</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2">
          {loading ? (
            <>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-24" />
            </>
          ) : user ? (
            <>
              <p className="text-sm text-muted-foreground">Welcome, {user.email}</p>
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login"><LogIn/>Login</Link>
              </Button>
              <Button variant="default" asChild>
                <Link href="/signup"><UserPlus/>Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
                 {loading ? (
                    <>
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </>
                  ) : user ? (
                    <>
                      <p className="text-sm text-muted-foreground">Welcome, {user.email}</p>
                      <Button variant="ghost" onClick={handleSignOut} className="w-full">
                        <LogOut />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                       <Button variant="ghost" asChild className="w-full">
                          <Link href="/login"><LogIn/>Login</Link>
                        </Button>
                        <Button variant="default" asChild className="w-full">
                          <Link href="/signup"><UserPlus/>Sign Up</Link>
                        </Button>
                    </>
                  )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
