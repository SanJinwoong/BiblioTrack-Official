
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from './ui/input';
import { Library } from './icons/uat-logo';

interface ClientHeaderProps {
    username: string;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

export function ClientHeader({ username, searchTerm, setSearchTerm }: ClientHeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userUsername');
    router.push('/');
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // The search is already happening live, but we can keep this for future enhancements
    // e.g. navigating to a dedicated search page
    console.log("Searching for:", searchTerm);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        <div className="mr-4 md:flex">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Library className="h-8 w-8 text-primary" />
            <span className="hidden font-bold sm:inline-block text-lg text-foreground">
              BiblioTrack
            </span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            href="#my-books"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            My Activity
          </Link>
          <Link
            href="#browse"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Catalog
          </Link>
          <Link
            href="#recommendations"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Recommendations
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search books..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </form>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">My Account</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {username}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
