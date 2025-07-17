
import { ShieldCheck } from 'lucide-react';
import { ModeToggle } from './mode-toggle';

export default function Header() {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="ml-3 text-2xl font-bold text-foreground font-headline">MevWatch</h1>
        </div>
        <ModeToggle />
      </div>
    </header>
  );
}
