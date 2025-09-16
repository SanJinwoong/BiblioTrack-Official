
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
    console.log("Searching for:", searchTerm);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        <div className="mr-auto flex items-center">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Library className="h-7 w-7 text-primary" />
            <span className="hidden font-bold sm:inline-block text-xl text-foreground">
              BiblioTrack
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center space-x-2 md:space-x-4 max-w-lg w-full">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar libros por título o autor..."
                    className="pl-9 h-10 rounded-full bg-muted border-0 focus-visible:ring-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </form>
        </div>
         <div className="flex flex-1 items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Mi Cuenta</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {username}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
