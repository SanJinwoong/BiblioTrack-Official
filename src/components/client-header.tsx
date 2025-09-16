

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Search, User, UserCog, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Input } from './ui/input';
import { Library } from './icons/uat-logo';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User as UserType, Category } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"


interface ClientHeaderProps {
    username: string;
    onSelectCategory: (category: string | null) => void;
    categories: Category[];
}

export function ClientHeader({ username, onSelectCategory, categories }: ClientHeaderProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [open, setOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  useEffect(() => {
    if (!username) return;

    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserType));
        const foundUser = usersData.find(u => u.username === username);
        setCurrentUser(foundUser || null);
    });

    return () => unsubscribe();
  }, [username]);


  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userUsername');
    router.push('/');
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (localSearchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(localSearchTerm.trim())}`);
    }
  }

  const handleScrollTo = (id: string) => {
    setOpen(false);
    
    // If we're not on the main dashboard, navigate there first.
    if (window.location.pathname !== '/dashboard') {
        router.push('/dashboard');
        // Wait for navigation to complete before scrolling
        setTimeout(() => {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 500);
    } else {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
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

        <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
            <Button variant="link" className="text-muted-foreground hover:text-primary" onClick={() => handleScrollTo('my-activity')}>Mi Actividad</Button>
            <Button variant="link" className="text-muted-foreground hover:text-primary" onClick={() => handleScrollTo('browse-categories')}>Explorar</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="link" className="text-muted-foreground hover:text-primary">Categorías</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onSelectCategory(null)}>Todas</DropdownMenuItem>
                <DropdownMenuSeparator />
                {Array.isArray(categories) && categories.map(cat => (
                  <DropdownMenuItem key={cat.id} onClick={() => onSelectCategory(cat.name)}>
                    {cat.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="link" className="text-muted-foreground hover:text-primary" onClick={() => handleScrollTo('recommendations')}>Recomendaciones</Button>
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar libros o amigos..."
                    className="pl-9 h-9 rounded-full bg-muted border-0 focus-visible:ring-primary"
                    value={localSearchTerm}
                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                />
            </form>
         
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={currentUser?.avatarUrl} alt={currentUser?.name || ''} />
                  <AvatarFallback>
                    {currentUser?.name ? currentUser.name.charAt(0) : <User className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
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
               <DropdownMenuItem asChild>
                  <Link href={`/profile/${username}`}>
                    <UserCog className="mr-2 h-4 w-4" />
                    <span>Mi Perfil</span>
                  </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle className="sr-only">Navegación Principal</SheetTitle>
                </SheetHeader>
                <nav className="grid gap-6 text-lg font-medium mt-8">
                  <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold" onClick={() => setOpen(false)}>
                      <Library className="h-7 w-7 text-primary" />
                      <span>BiblioTrack</span>
                  </Link>
                  <a className="text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => handleScrollTo('my-activity')}>Mi Actividad</a>
                  <a className="text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => handleScrollTo('browse-categories')}>Explorar</a>
                  <a className="text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => handleScrollTo('recommendations')}>Recomendaciones</a>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
