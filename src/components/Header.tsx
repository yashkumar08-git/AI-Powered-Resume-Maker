import { Wand2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 border-b bg-card">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary/10 group-hover:bg-primary/20 rounded-full transition-colors">
            <Wand2 className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">Resume Maker</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost">Login</Button>
          <Button variant="default">Sign Up</Button>
        </div>
      </div>
    </header>
  );
}
