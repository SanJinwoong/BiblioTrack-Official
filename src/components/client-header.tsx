
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
    // In a real app, you might want to navigate to a search results page
    // or trigger a search action here.
    console.log("Searching for:", searchTerm);
  }

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Button variant="link" className="text-muted-foreground hover:text-primary p-0" onClick={() => handleScrollTo('my-activity')}>Mi Actividad</Button>
            <Button variant="link" className="text-muted-foreground hover:text-primary p-0" onClick={() => handleScrollTo('browse-categories')}>Explorar</Button>
            <Button variant="link" className="text-muted-foreground hover:text-primary p-0" onClick={() => handleScrollTo('recommendations')}>Recomendaciones</Button>
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar libros..."
                    className="pl-9 h-9 rounded-full bg-muted border-0 focus-visible:ring-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </form>
         
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
