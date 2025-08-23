
"use client";

import { Wand2 } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 border-b animate-fade-in-down sticky top-0 z-40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary/10 group-hover:bg-primary/20 rounded-full transition-all duration-300 transform group-hover:scale-110">
            <Wand2 className="h-6 w-6 text-primary transition-transform duration-300 group-hover:rotate-12" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">Resume Maker</span>
        </Link>
      </div>
    </header>
  );
}

    